// Componente principal de la App
import React, { useState, useRef, useEffect } from "react";

// Componentes UI
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Librerías para PDF y gráficos
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  RadarController,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
} from "chart.js";

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  RadarController,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler
);

// Estilos comunes
const labelStyle = "font-semibold text-gray-700 block mb-1";
const inputStyle = "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50";

// Datos del cuestionario
const preguntas = [
  // Primera parte - Preguntas 1-9
  ["Muestro dedicación a las personas que amo", "Actuo con perseverancia"],
  ["Soy tolerante", "Prefiero actuar con ética"],
  ["Al pensar utilizo mi intuición o sexto sentido", "Me siento una persona digna"],
  ["Logro buena concentración mental", "Perdono todas las ofensas de cualquier persona"],
  ["Normalmente razono mucho", "Me destaco por el liderazgo en mis acciones"],
  ["Pienso con Integridad", "Me coloco objetivos y metas en mi vida personal"],
  ["Soy una persona de iniciativa", "En mi trabajo normalmente soy curioso"],
  ["Doy Amor", "Para pensar hago síntesis de las distintas ideas"],
  ["Me siento en calma", "Pienso con veracidad"],
  
  // Segunda parte - Preguntas 10-30
  ["Irrespetar la propiedad", "Sentir inquietud"],
  ["Ser irrespetable", "ser desconsiderado hacia cualquier persona"],
  ["Caer en contradicción al pensar", "Sentir Intolerancia"],
  ["Ser violento", "Actuar con cobardía"],
  ["Sentirse Presumido", "Generar divisiones y discordia entre los seres humanos"],
  ["Ser Cruel", "Sentir ira"],
  ["Pensar con confusión", "Tener odio en el corazón"],
  ["Decir blasfemias", "Ser Escandaloso"],
  ["Crear desigualdades entre los seres humanos", "Apasionarse por una idea"],
  ["Sentirse inconstante", "Crear Rivalidad hacia otros"],
  ["Pensamientos Irracionales", "Traicionar a un desconocido"],
  ["Ostentar riquezas materiales", "Sentirse Infeliz"],
  ["Entorpecer la comunicación entre seres humanos", "la maldad"],
  ["Odiar a cualquier ser de la naturaleza", "Hacer distinciones entre las personas"],
  ["Sentirse intranquilo", "Ser Infiel"],
  ["Tener la mente dispersa", "Mostrar apatía al pensar"],
  ["la injusticia", "Sentirse Angustiado"],
  ["ventajarse de los que odian a todo el mundo", "Vengarse del que hace daño a un familiar"],
  ["Usar abusivamente el poder", "Distraerse"],
  ["Ser desagradecido con los que ayudan", "Ser Egoísta con todos"],
  ["Cualquier forma de irrespeto", "odiar"]
];

/**
 * Componente principal ValantiApp
 * Implementa un cuestionario de valores VALANTI con cálculo de resultados y generación de PDF
 */
const ValantiApp = () => {
  // =========================================================================
  // ESTADOS
  // =========================================================================
  
  // Estado para el formulario
  const [formData, setFormData] = useState({
    nombre: "",
    edad: "",
    sexo: "",
    educacion: "",
    cargo: "",
    responses: Array(preguntas.length).fill({ a: "", b: "" }),
    invalids: Array(preguntas.length).fill(false),
  });

  // Estado para los resultados
  const [results, setResults] = useState(null);
  
  // =========================================================================
  // REFERENCIAS
  // =========================================================================
  
  // Referencias para el gráfico y resultados
  const chartRef = useRef(null);
  const resultsCardRef = useRef(null);

  // =========================================================================
  // EFECTOS
  // =========================================================================
  
  // Efecto para dibujar el gráfico cuando los resultados cambian
  useEffect(() => {
    if (results && chartRef.current) {
      const ctx = chartRef.current.getContext("2d");
      
      // Limpiar gráfico anterior si existe
      if (window.radarChartValanti instanceof ChartJS) {
        window.radarChartValanti.destroy();
      }
      
      // Crear nuevo gráfico
      window.radarChartValanti = new ChartJS(ctx, {
        type: "radar",
        data: {
          labels: Object.keys(results.standardScores),
          datasets: [
            {
              label: formData.nombre || "Resultado",
              data: Object.values(results.standardScores),
              backgroundColor: "rgba(30, 64, 175, 0.2)",
              borderColor: "#1e40af",
              pointBackgroundColor: "#1e40af",
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            r: {
              beginAtZero: true,
              suggestedMin: 0,
              suggestedMax: 100,
              ticks: {
                stepSize: 20
              },
              pointLabels: {
                font: {
                  size: 10
                }
              }
            },
          },
          plugins: {
            legend: {
              position: "top",
            },
            title: {
              display: true,
              text: "Perfil valoral, cuestionario VALANTI",
            },
          },
        },
      });
    }
    
    // Limpiar el gráfico al desmontar el componente
    return () => {
      if (window.radarChartValanti instanceof ChartJS) {
        window.radarChartValanti.destroy();
      }
    };
  }, [results, formData.nombre]);

  // =========================================================================
  // MANEJADORES DE FORMULARIO
  // =========================================================================
  
  /**
   * Maneja cambios en campos de texto
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  /**
   * Maneja cambios en campos de selección
   */
  const handleSelectChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
  };
  
  /**
   * Maneja cambios en respuestas del cuestionario
   * Valida que los valores estén entre 0 y 3, y calcula automáticamente el valor B
   */
  const handleResponseChange = (index, value) => {
    const numValue = parseInt(value);
    const updatedInvalids = [...formData.invalids];
    const updatedResponses = [...formData.responses];

    if (isNaN(numValue) || numValue < 0 || numValue > 3) {
      updatedInvalids[index] = true;
    } else {
      updatedInvalids[index] = false;
      updatedResponses[index] = { 
        a: numValue.toString(), 
        b: (3 - numValue).toString() 
      };
    }
    
    setFormData((prev) => ({ 
      ...prev, 
      responses: updatedResponses, 
      invalids: updatedInvalids 
    }));
  };

  /**
   * Maneja el envío del formulario
   * Valida campos y calcula resultados
   */
  const handleSubmit = () => {
    // Validar campos de información personal
    const hasEmptyFields = Object.values(formData)
      .slice(0, 5) // Solo los primeros 5 campos de información personal
      .some(value => typeof value === 'string' && value.trim() === "");

    if (hasEmptyFields) {
      alert("Por favor complete todos los campos de información personal.");
      return;
    }

    // Validar respuestas del cuestionario
    const hasEmptyResponses = formData.responses.some(r => r.a === "" || r.b === "");
    const hasInvalidResponses = formData.invalids.some(i => i);
    
    if (hasEmptyResponses) {
      alert("Por favor complete todas las respuestas del cuestionario.");
      return;
    }
    
    if (hasInvalidResponses) {
      alert("Hay respuestas inválidas. Por favor, corrija los valores (deben estar entre 0 y 3).");
      return;
    }
    
    // Calcular puntajes
    calculateScores();
  };

  // =========================================================================
  // FUNCIONES DE CÁLCULO Y ANÁLISIS
  // =========================================================================
  
  /**
   * Obtiene interpretación de resultados basada en puntajes estándar
   */
  const getInterpretation = (standardScores) => {
    const entries = Object.entries(standardScores);
    // Filtrar entradas no numéricas o NaN antes de ordenar
    const validEntries = entries.filter(([key, value]) => 
      typeof value === 'number' && !isNaN(value)
    );

    if (validEntries.length === 0) {
      return "No hay datos suficientes para generar una interpretación.";
    }

    const sorted = [...validEntries].sort(([, valA], [, valB]) => valB - valA);
    const highest = sorted[0][0];
    const lowest = sorted[sorted.length - 1][0];
    
    return `El valor más importante es ${highest}. El valor menos enfatizado es ${lowest}.`;
  };

  /**
   * Calcula puntajes directos y estándar basados en las respuestas
   */
  const calculateScores = () => {
    // Definición de rasgos y sus preguntas asociadas (índices 1-based)
    const traits = {
      Verdad: [1, 7, 13, 19, 25],
      Rectitud: [2, 8, 14, 20, 26],
      Paz: [3, 9, 15, 21, 27],
      Amor: [4, 10, 16, 22, 28],
      "No violencia": [5, 11, 17, 23, 29],
    };
  
    // Inicializar puntajes directos
    const directScores = {
      Verdad: 0,
      Rectitud: 0,
      Paz: 0,
      Amor: 0,
      "No violencia": 0,
    };
  
    // Calcular puntajes directos
    Object.keys(traits).forEach((trait) => {
      traits[trait].forEach((qIndex) => {
        // qIndex es 1-based, formData.responses es 0-based
        if (qIndex - 1 < formData.responses.length) {
          const answer = formData.responses[qIndex - 1];
          const a = parseInt(answer.a);
          
          if (!isNaN(a)) {
            directScores[trait] += 3; // Cada respuesta completa suma 3 puntos
          }
        }
      });
    });
  
    // Promedios nacionales y desviaciones estándar para normalización
    const nationalAverages = {
      Verdad: 15.65, 
      Rectitud: 21.05, 
      Paz: 17.35, 
      Amor: 16.68, 
      "No violencia": 21.22,
    };
  
    const standardDevs = {
      Verdad: 4.7, 
      Rectitud: 4.44, 
      Paz: 6.61, 
      Amor: 5.41, 
      "No violencia": 7.19,
    };
  
    // Calcular puntajes estándar (escala T: media 50, desviación 10)
    const standardScores = {};
    Object.keys(directScores).forEach((trait) => {
      const z = (directScores[trait] - nationalAverages[trait]) / standardDevs[trait];
      standardScores[trait] = Math.round(z * 10 + 50);
    });
  
    // Obtener interpretación y establecer resultados
    const interpretation = getInterpretation(standardScores);
    setResults({ directScores, standardScores, interpretation });
  };

  // =========================================================================
  // FUNCIONES DE EXPORTACIÓN
  // =========================================================================
  
  /**
   * Genera y descarga un PDF con los resultados
   */
  const handleDownloadPDF = async () => {
    if (!results) {
      alert("Primero calcula los resultados.");
      return;
    }
  
    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const margin = 15;
    const pageWidth = pdf.internal.pageSize.getWidth();
    const usableWidth = pageWidth - 2 * margin;
    let y = margin;
  
    // Título
    pdf.setFontSize(16);
    pdf.text("Hoja de Resultados - Cuestionario VALANTI", pageWidth / 2, y, { align: 'center' });
    y += 10;
  
    // Información personal
    pdf.setFontSize(10);
    pdf.text(`Nombre: ${formData.nombre}`, margin, y);
    pdf.text(`Edad: ${formData.edad}`, pageWidth / 2, y);
    y += 7;
    pdf.text(`Sexo: ${formData.sexo}`, margin, y);
    pdf.text(`Educación: ${formData.educacion}`, pageWidth / 2, y);
    y += 7;
    pdf.text(`Cargo: ${formData.cargo}`, margin, y);
    y += 10;
  
    // Respuestas del cuestionario
    pdf.setFontSize(12);
    pdf.text("Respuestas del Cuestionario (Valor A / Valor B)", margin, y);
    y += 7;
    pdf.setFontSize(9);
  
    const halfIndex = Math.ceil(preguntas.length / 2);
    for (let i = 0; i < halfIndex; i++) {
      const resp1 = formData.responses[i];
      const text1 = `${i + 1}. ${preguntas[i][0].substring(0,25)}... / ${preguntas[i][1].substring(0,25)}... : (${resp1.a}/${resp1.b})`;
      pdf.text(text1, margin, y);
  
      if (i + halfIndex < preguntas.length) {
        const resp2 = formData.responses[i + halfIndex];
        const text2 = `${i + halfIndex + 1}. ${preguntas[i+halfIndex][0].substring(0,25)}... / ${preguntas[i+halfIndex][1].substring(0,25)}... : (${resp2.a}/${resp2.b})`;
        pdf.text(text2, pageWidth / 2, y);
      }
      
      y += 5;
      if (y > pdf.internal.pageSize.getHeight() - margin - 10) {
        pdf.addPage();
        y = margin;
      }
    }
    
    y += 5; // Espacio extra
    if (y > pdf.internal.pageSize.getHeight() - margin - 70) {
      pdf.addPage();
      y = margin;
    }

    // Puntajes por valor
    pdf.setFontSize(12);
    pdf.text("Puntajes por Valor", margin, y);
    y += 7;
    pdf.setFontSize(10);
    
    Object.entries(results.directScores).forEach(([valor, puntaje]) => {
      pdf.text(`${valor}: Puntaje directo: ${puntaje}, Puntaje estándar: ${results.standardScores[valor]}`, margin, y);
      y += 6;
      
      if (y > pdf.internal.pageSize.getHeight() - margin) { 
        pdf.addPage();
        y = margin;
      }
    });
    
    y += 5;
  
    // Interpretación
    pdf.setFontSize(12);
    pdf.text("Interpretación:", margin, y);
    y += 7;
    pdf.setFontSize(10);
    
    const splitText = pdf.splitTextToSize(results.interpretation, usableWidth);
    pdf.text(splitText, margin, y);
    y += splitText.length * 4 + 5;
  
    // Añadir gráfico
    if (chartRef.current) {
      try {
        const canvasImage = await html2canvas(chartRef.current, { scale: 2 });
        const imgData = canvasImage.toDataURL("image/png");
        
        if (y + 100 > pdf.internal.pageSize.getHeight() - margin) {
          pdf.addPage();
          y = margin;
        }
        
        const imageWidth = usableWidth - 20;
        const imageHeight = imageWidth * (canvasImage.height / canvasImage.width);
        pdf.addImage(imgData, "PNG", margin, y, imageWidth, imageHeight);
      } catch (error) {
        console.error("Error generando imagen del gráfico:", error);
        pdf.text("No se pudo generar el gráfico en el PDF.", margin, y);
      }
    }
    
    // Guardar PDF
    pdf.save(`valanti-resultados-${formData.nombre.replace(/\s+/g, '_') || 'usuario'}.pdf`);
  };
  
  // =========================================================================
  // RENDERIZADO DEL COMPONENTE
  // =========================================================================
  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Formulario de información personal */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Cuestionario VALANTI</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="nombre" className={labelStyle}>Nombre Completo:</Label>
            <Input 
              id="nombre" 
              name="nombre" 
              value={formData.nombre} 
              onChange={handleInputChange} 
              className={inputStyle} 
              placeholder="Tu nombre"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="edad" className={labelStyle}>Edad:</Label>
              <Input 
                id="edad" 
                name="edad" 
                type="number" 
                value={formData.edad} 
                onChange={handleInputChange} 
                className={inputStyle} 
                placeholder="Tu edad"
              />
            </div>
            <div>
              <Label htmlFor="sexo" className={labelStyle}>Sexo:</Label>
              <Select 
                name="sexo" 
                onValueChange={(value) => handleSelectChange('sexo', value)} 
                value={formData.sexo}
              >
                <SelectTrigger className={inputStyle}>
                  <SelectValue placeholder="Selecciona tu sexo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Masculino">Masculino</SelectItem>
                  <SelectItem value="Femenino">Femenino</SelectItem>
                  <SelectItem value="Otro">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div>
            <Label htmlFor="educacion" className={labelStyle}>Nivel Educativo:</Label>
            <Input 
              id="educacion" 
              name="educacion" 
              value={formData.educacion} 
              onChange={handleInputChange} 
              className={inputStyle} 
              placeholder="Ej: Secundaria, Universitario, etc."
            />
          </div>
          
          <div>
            <Label htmlFor="cargo" className={labelStyle}>Cargo Actual:</Label>
            <Input 
              id="cargo" 
              name="cargo" 
              value={formData.cargo} 
              onChange={handleInputChange} 
              className={inputStyle} 
              placeholder="Tu cargo"
            />
          </div>
        </CardContent>
      </Card>

      {/* Cuestionario */}
      <Card>
        <CardHeader>
          <CardTitle>Cuestionario</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            Para cada par de frases, distribuye 3 puntos entre las dos opciones (A y B) según tu preferencia. 
            Puedes asignar (3A, 0B), (2A, 1B), (1A, 2B), o (0A, 3B).
          </p>
          
          {preguntas.map((par, index) => (
            <div key={index} className="p-3 border rounded-md shadow-sm bg-gray-50">
              {/* Mostrar instrucciones especiales para la segunda parte */}
              {index === 9 && (
                <div className="p-4 bg-blue-100 border border-blue-300 rounded-md text-sm text-blue-900 font-medium mb-4">
                  <p className="uppercase font-bold mb-2">Segunda Parte</p>
                  <p>
                    Por favor, marque cero, uno, dos o tres en las casillas del centro, para la frase más inaceptable, según su juicio.
                    El puntaje más alto será para la frase que indique lo peor. Las únicas opciones de respuesta son: 3-0, 0-3, 2-1, 1-2. 
                    La suma de las casillas debe ser 3.
                  </p>
                </div>
              )}
              
              <p className="text-sm font-medium mb-2">Pregunta {index + 1}:</p>
              <div className="grid grid-cols-12 gap-2 items-center">
                <div className="col-span-5">
                  <Label htmlFor={`q${index}a`} className="text-xs text-gray-700">{par[0]} (A)</Label>
                </div>
                <div className="col-span-2">
                  <Input
                    id={`q${index}a`}
                    type="number"
                    min="0"
                    max="3"
                    value={formData.responses[index].a}
                    onChange={(e) => handleResponseChange(index, e.target.value)}
                    className={`${inputStyle} text-center ${formData.invalids[index] ? 'border-red-500' : ''}`}
                    placeholder="A"
                  />
                </div>
                <div className="col-span-5">
                  <Label htmlFor={`q${index}b`} className="text-xs text-gray-700">(B) {par[1]}</Label>
                  <p className="text-sm text-center mt-1">
                    B: <span className="font-semibold">{formData.responses[index].b !== "" ? formData.responses[index].b : "-"}</span>
                  </p>
                </div>
              </div>
              
              {formData.invalids[index] && (
                <p className="text-red-500 text-xs mt-1">Valor A debe ser entre 0 y 3.</p>
              )}
            </div>
          ))}
        </CardContent>
        <CardFooter>
          <Button 
            onClick={handleSubmit} 
            className="w-full md:w-auto"
            disabled={formData.invalids.some(i => i) || formData.responses.some(r => r.a === "" || r.b === "")}
          >
            Calcular Resultados
          </Button>
        </CardFooter>
      </Card>

      {/* Resultados */}
      {results && (
        <Card ref={resultsCardRef}>
          <CardHeader>
            <CardTitle>Resultados del Cuestionario VALANTI</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className={`${labelStyle} text-lg`}>Puntajes Directos:</h3>
              <ul className="list-disc list-inside">
                {Object.entries(results.directScores).map(([key, value]) => (
                  <li key={key}><span className="font-semibold">{key}:</span> {value}</li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className={`${labelStyle} text-lg`}>Puntajes Estándar:</h3>
              <ul className="list-disc list-inside">
                {Object.entries(results.standardScores).map(([key, value]) => (
                  <li key={key}><span className="font-semibold">{key}:</span> {value}</li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className={`${labelStyle} text-lg mb-2`}>Gráfico de Perfil Valoral:</h3>
              <div style={{ position: 'relative', height: '300px', width: '100%', maxWidth: '500px', margin: 'auto' }}>
                <canvas ref={chartRef} id="radar-chart-valanti"></canvas>
              </div>
            </div>
            
            <div>
              <h3 className={`${labelStyle} text-lg`}>Interpretación:</h3>
              <p className="text-gray-800">{results.interpretation}</p>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleDownloadPDF} className="w-full md:w-auto">
              Descargar Resultados en PDF
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
};

export default ValantiApp;