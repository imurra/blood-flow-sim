import React, { useState, useEffect, useRef } from 'react';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { useIsMobile } from '@/hooks/use-mobile';

const BloodFlowSimulator = () => {
  const BASE_RESISTANCE = 0.00484;
  const [upstreamPressure, setUpstreamPressure] = useState(120);
  const [downstreamPressure, setDownstreamPressure] = useState(5);
  const [constrictionPercent, setConstrictionPercent] = useState(28);
  const [flow, setFlow] = useState(5000);
  const [resetTrigger, setResetTrigger] = useState(0);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Array<{x: number, y: number, speed: number}>>([]);

  // Window resize detection
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = useIsMobile();

  const getAdjustedPressures = (upstream: number, downstream: number, constriction: number) => {
    const normalConstriction = 28;
    const pressureChange = (constriction - normalConstriction) * 0.5;
    return {
      upstream: upstream + pressureChange,
      downstream
    };
  };

  useEffect(() => {
    const { upstream, downstream } = getAdjustedPressures(
      upstreamPressure, 
      downstreamPressure, 
      constrictionPercent
    );
    
    const deltaP = upstream - downstream;
    const resistance = BASE_RESISTANCE * Math.pow(100 / (100 - constrictionPercent), 4);
    const newFlow = deltaP / resistance;
    
    setFlow(newFlow);
  }, [upstreamPressure, downstreamPressure, constrictionPercent]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let animationFrameId: number;

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    };

    // Add a small delay to ensure the canvas is properly mounted
    setTimeout(() => {
      resizeCanvas();
      window.addEventListener('resize', resizeCanvas);

      const createParticles = () => {
        const particleCount = 200;
        const particles = [];
        for (let i = 0; i < particleCount; i++) {
          particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            speed: 0,
          });
        }
        return particles;
      };
      
      particlesRef.current = createParticles();

      const animate = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Only animate if canvas has proper dimensions
        if (canvas.width === 0 || canvas.height === 0) {
          animationFrameId = requestAnimationFrame(animate);
          return;
        }

        const normalWidth = canvas.height * 0.4;
        const restrictedWidth = normalWidth * (1 - constrictionPercent/100);
        const restrictionPoint = canvas.width * 0.3;

        // Draw vessel outline
        ctx.beginPath();
        ctx.moveTo(0, canvas.height/2 - normalWidth/2);
        ctx.lineTo(restrictionPoint, canvas.height/2 - normalWidth/2);
        ctx.lineTo(restrictionPoint, canvas.height/2 - restrictedWidth/2);
        ctx.lineTo(canvas.width, canvas.height/2 - restrictedWidth/2);
        ctx.lineTo(canvas.width, canvas.height/2 + restrictedWidth/2);
        ctx.lineTo(restrictionPoint, canvas.height/2 + restrictedWidth/2);
        ctx.lineTo(restrictionPoint, canvas.height/2 + normalWidth/2);
        ctx.lineTo(0, canvas.height/2 + normalWidth/2);
        ctx.closePath();
        ctx.fillStyle = 'rgba(255, 240, 240, 0.5)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
        ctx.lineWidth = 2;
        ctx.stroke();

        const { upstream, downstream } = getAdjustedPressures(
          upstreamPressure, 
          downstreamPressure, 
          constrictionPercent
        );

        const flowDirection = upstream >= downstream ? 1 : -1;

        // Animate particles
        particlesRef.current.forEach((particle) => {
          const areaRatio = Math.pow(normalWidth/restrictedWidth, 2);
          const velocityMultiplier = particle.x < restrictionPoint ? 1 : Math.min(areaRatio, 5);
          const distanceFromCenter = Math.abs(particle.y - canvas.height/2);
          const currentWidth = particle.x < restrictionPoint ? normalWidth : restrictedWidth;
          const normalizedDistance = distanceFromCenter / (currentWidth/2);
          const laminarProfile = Math.max(0, 1 - Math.pow(normalizedDistance, 2));
          const baseSpeed = Math.max(Math.abs(flow)/5000, 0.1);

          particle.speed = baseSpeed * velocityMultiplier * flowDirection * laminarProfile;

          if (distanceFromCenter <= currentWidth/2) {
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, 2, 0, Math.PI * 2);
            ctx.fillStyle = 'red';
            ctx.fill();

            particle.x += particle.speed;

            if ((flowDirection > 0 && particle.x > canvas.width) || 
                (flowDirection < 0 && particle.x < 0)) {
              particle.x = flowDirection > 0 ? 0 : canvas.width;
              particle.y = Math.random() * currentWidth + (canvas.height/2 - currentWidth/2);
            }
          } else {
            particle.x = flowDirection > 0 ? 0 : canvas.width;
            particle.y = Math.random() * normalWidth + (canvas.height/2 - normalWidth/2);
          }
        });

        animationFrameId = requestAnimationFrame(animate);
      };

      animate();
    }, 100);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, [flow, constrictionPercent, upstreamPressure, downstreamPressure]);

  const getPressureData = () => {
    const { upstream, downstream } = getAdjustedPressures(
      upstreamPressure,
      downstreamPressure,
      constrictionPercent
    );
    
    const data = [];
    const steps = 10;
    const totalPressureDrop = upstream - downstream;
    const flowDirection = upstream >= downstream ? 1 : -1;
    const restrictionPoint = 3;
    const restrictionLength = 2;
    
    for (let i = 0; i <= steps; i++) {
      const position = (i / steps) * 100;
      let pressure;
      
      if (position < restrictionPoint * 10) {
        pressure = upstream - (totalPressureDrop * 0.1 * (position / (restrictionPoint * 10))) * flowDirection;
      } else if (position <= (restrictionPoint + restrictionLength) * 10) {
        const fracThroughRestriction = (position - restrictionPoint * 10) / (restrictionLength * 10);
        const pressureDropInRestriction = totalPressureDrop * 0.8;
        pressure = upstream - ((totalPressureDrop * 0.1) + (pressureDropInRestriction * fracThroughRestriction)) * flowDirection;
      } else {
        const fracRemaining = (position - (restrictionPoint + restrictionLength) * 10) / (100 - (restrictionPoint + restrictionLength) * 10);
        const pressureAtEndOfRestriction = upstream - (totalPressureDrop * 0.9) * flowDirection;
        pressure = pressureAtEndOfRestriction - (totalPressureDrop * 0.1 * fracRemaining) * flowDirection;
      }
      
      data.push({ position: position.toFixed(0), pressure: Math.round(pressure) });
    }
    return data;
  };

  const { upstream, downstream } = getAdjustedPressures(
    upstreamPressure, 
    downstreamPressure, 
    constrictionPercent
  );
  
  const flowDirection = upstream >= downstream;

  console.log('Pressure data:', getPressureData()); // Debug log

  return (
    <div className={`max-w-6xl mx-auto min-h-screen relative ${isMobile ? 'p-2' : 'p-4'} bg-gray-50`}>
      <Card className={isMobile ? "mb-1" : "mb-4"}>
        <CardHeader className={isMobile ? "pb-0 pt-2" : ""}>
          <CardTitle className={isMobile ? "text-sm leading-tight" : ""}>
            {isMobile ? "Blood Flow Simulator" : "Blood Flow Simulator: Vessel with Variable Constriction"}
          </CardTitle>
        </CardHeader>
        <CardContent className={isMobile ? "p-2" : ""}>
          <div className={`flex items-center justify-between ${isMobile ? 'mb-2' : 'mb-4'}`}>
            {isMobile ? (
              <div className="flex justify-between w-full text-xs">
                <div className="text-center">
                  <div className="font-bold">Upstream</div>
                  <div className="text-blue-600 font-semibold">{upstream.toFixed(1)} mmHg</div>
                </div>
                {flowDirection ? <ArrowRight className="mx-2" size={16} /> : <ArrowLeft className="mx-2" size={16} />}
                <div className="text-center">
                  <div className="font-bold">Downstream</div>
                  <div className="text-blue-600 font-semibold">{downstream.toFixed(1)} mmHg</div>
                </div>
              </div>
            ) : (
              <>
                <div className="text-center">
                  <div className="font-bold">Upstream Pressure</div>
                  <div className="text-blue-600 font-semibold">{upstream.toFixed(1)} mmHg</div>
                </div>
                {flowDirection ? <ArrowRight className="mx-4" /> : <ArrowLeft className="mx-4" />}
                <div className="text-center">
                  <div className="font-bold">Downstream Pressure</div>
                  <div className="text-blue-600 font-semibold">{downstream.toFixed(1)} mmHg</div>
                </div>
              </>
            )}
          </div>
          <div className="relative">
            <canvas 
              ref={canvasRef} 
              className={`w-full bg-gray-100 rounded border ${isMobile ? 'h-20' : 'h-40'}`}
              style={{ display: 'block' }}
            />
            {isMobile ? (
              <div className="absolute bottom-1 right-2 text-[8px] text-gray-500 bg-white bg-opacity-75 px-1 rounded">
                Created by Dr Ian Murray; CC BY-NC-SA
              </div>
            ) : (
              <div className="absolute bottom-1 right-2 text-xs text-gray-500 bg-white bg-opacity-75 px-1 rounded">
                Created by Dr Ian Murray; CC BY-NC-SA
              </div>
            )}
          </div>
          {isMobile ? (
            <div className="text-center mt-1">
              <div className="font-bold text-xs">Flow</div>
              <div className="text-xs text-green-600 font-semibold">{flow.toFixed(2)} mL/min</div>
            </div>
          ) : (
            <div className="text-center mt-2">
              <div className="font-bold">Flow</div>
              <div className="text-green-600 font-semibold">{flow.toFixed(2)} mL/min</div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className={isMobile ? "flex flex-col gap-1 mb-1" : "flex gap-4 mb-2"}>
        <div className={isMobile ? "w-full" : "w-2/5"}>
          <Card>
          {!isMobile && (
            <CardHeader>
              <CardTitle>Controls</CardTitle>
            </CardHeader>
          )}
          <CardContent className={isMobile ? "p-2 space-y-1" : ""}>
            <div className={isMobile ? "mb-1" : "mb-4"}>
              <div className="flex justify-between items-center">
                <label className={`${isMobile ? 'text-xs' : 'block mb-2'} font-medium text-gray-700`}>
                  {isMobile ? 'Upstream Pressure (0-250 mmHg)' : 'Upstream Pressure'}
                </label>
                {isMobile && (
                  <button 
                    className="px-2 py-0.5 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                    onClick={() => {
                      setUpstreamPressure(120);
                      setDownstreamPressure(5);
                      setConstrictionPercent(28);
                      setResetTrigger(prev => prev + 1);
                    }}
                  >
                    Reset
                  </button>
                )}
              </div>
              {!isMobile && <div className="text-xs text-gray-500 mb-2">0-250 mmHg</div>}
              <Slider
                value={[upstreamPressure]}
                onValueChange={(value) => setUpstreamPressure(value[0])}
                max={250}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0</span>
                <span>250</span>
              </div>
            </div>

            <div className={isMobile ? "mb-1" : "mb-4"}>
              <label className={`${isMobile ? 'text-xs' : 'block mb-2'} font-medium text-gray-700`}>
                {isMobile ? 'Downstream Pressure (0-100 mmHg)' : 'Downstream Pressure'}
              </label>
              {!isMobile && <div className="text-xs text-gray-500 mb-2">0-100 mmHg</div>}
              <Slider
                value={[downstreamPressure]}
                onValueChange={(value) => setDownstreamPressure(value[0])}
                max={100}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0</span>
                <span>100</span>
              </div>
            </div>

            <div>
              <label className={`${isMobile ? 'text-xs' : 'block mb-2'} font-medium text-gray-700`}>
                {isMobile ? 'Vessel Constriction (0-90%)' : 'Vessel Constriction'}
              </label>
              {!isMobile && <div className="text-xs text-gray-500 mb-2">0-90%</div>}
              <Slider
                value={[constrictionPercent]}
                onValueChange={(value) => setConstrictionPercent(value[0])}
                max={90}
                min={0}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0%</span>
                <span>90%</span>
              </div>
              <div className={`text-center mt-2 ${isMobile ? 'text-xs' : ''} font-semibold text-gray-700`}>{constrictionPercent}% constricted</div>
            </div>
            {!isMobile && (
              <button 
                className="w-full mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                onClick={() => {
                  setUpstreamPressure(120);
                  setDownstreamPressure(5);
                  setConstrictionPercent(28);
                  setResetTrigger(prev => prev + 1);
                }}
              >
                Reset to Default Values
              </button>
            )}
          </CardContent>
                  </Card>
        </div>

        <div className={isMobile ? "w-full" : "w-3/5"}>
          <Card>
          {!isMobile && (
            <CardHeader>
              <CardTitle>Pressure Along Vessel</CardTitle>
            </CardHeader>
          )}
          <CardContent className="p-4">
            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={getPressureData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="position" 
                    label={{ value: 'Position along vessel (%)', position: 'insideBottom', offset: -10 }}
                  />
                  <YAxis 
                    domain={[0, 200]}
                    label={{ value: 'Pressure (mmHg)', angle: -90, position: 'insideLeft' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="pressure" 
                    stroke="#3B82F6" 
                    strokeWidth={2}
                    dot={{ fill: '#3B82F6', strokeWidth: 2, r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
                  </Card>
        </div>
      </div>

      <Card className="mb-4">
        <CardHeader className={isMobile ? "pb-0 pt-2" : "pb-1"}>
          <CardTitle className={isMobile ? "text-sm" : ""}>Equation</CardTitle>
        </CardHeader>
        <CardContent className={isMobile ? "pt-0 pb-2" : "pt-1 pb-2"}>
          <div className={`text-center ${isMobile ? 'text-xs leading-tight' : 'text-lg'}`}>
            Flow = ΔP/R, where R ∝ 1/r⁴
          </div>
          <div className={`text-center ${isMobile ? 'text-xs leading-tight mt-1' : 'text-sm mt-1'}`}>
            Normal arteriolar tone is 28% constriction
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className={isMobile ? "pb-0 pt-2" : ""}>
          <CardTitle className={isMobile ? "text-sm" : ""}>About This Simulation</CardTitle>
        </CardHeader>
        <CardContent className={isMobile ? "pt-1 pb-2" : "pt-1 pb-2"}>
          <div className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-600 space-y-2`}>
            <p>This interactive simulation demonstrates how blood flow through a vessel is affected by pressure differences and vessel constriction. The visualization shows:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Red particles representing blood cells flowing through the vessel</li>
              <li>How constriction affects flow rate according to physiological principles</li>
              <li>Pressure changes along the vessel length</li>
              <li>Real-time calculations based on fluid dynamics</li>
            </ul>
            <p className="text-xs text-gray-500 mt-4">Educational tool created by Dr Ian Murray, distributed under CC BY-NC-SA license.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BloodFlowSimulator;