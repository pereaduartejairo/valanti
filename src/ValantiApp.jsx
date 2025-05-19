// Componente principal de al App
import React, { useState, useRef } from "react";
import { Button } from "./components/ui/button";
import { Card, CardContent } from "./components/ui/card";
import { Input } from "./components/ui/input";
import { Bar } from "react-chartjs-2";
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

const labelStyle = "font-semibold text-gray-700";
const valueStyle = "text-gray-900";

const preguntas = [
  ["Muestro dedicación a las personas que amo", "Actuo con perseverancia"],
  ["Soy tolerante", "Prefiero actuar con ética"],
  ["Al pensar utilizo mi intuición o sexto sentido", "Me siento una persona digna"],
  ["Logro buena concentración mental", "Perdono todas las ofensas de cualquier persona"],
  ["Normalmente razono mucho", "Me destaco por el liderazgo en mis acciones"],
  ["Pienso con Integridad", "Me coloco objetivos y metas en mi vida personal"],
  ["Soy una persona de iniciativa", "En mi trabajo normalmente soy curioso"],
  ["Doy Amor", "Para pensar hago síntesis de las distintas ideas"],
  ["Me siento en calma", "Pienso con veracidad"],
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
  ["Ser desagradado con los que ayudan", "Ser Egoísta con todos"],
  ["Cualquier forma de irrespeto", "odiar"]
];
const ValantiApp = () => {
    const [formData, setFormData] = useState({
      name: "",
      age: "",
      sex: "",
      education: "",
      position: "",
      responses: Array(30).fill({ a: "", b: "" }),
      invalids: Array(30).fill(false),
    });
  
    const [results, setResults] = useState(null);
    const resultRef = useRef();
  
    const handleInputChange = (e) => {
      const { name, value } = e.target;
      setFormData({ ...formData, [name]: value });
    };
  
    const handleResponseChange = (index, field, value) => {
      let a = parseInt(value);
      const updatedInvalids = [...formData.invalids];
      if (isNaN(a) || a < 0 || a > 3) {
        alert("Por favor ingrese un valor entre 0 y 3.");
        updatedInvalids[index] = true;
        setFormData((prev) => ({ ...prev, invalids: updatedInvalids }));
        return;
      } else {
        updatedInvalids[index] = false;
      }
      const b = 3 - a;
      const updatedResponses = [...formData.responses];
      updatedResponses[index] = { a: a.toString(), b: b.toString() };
      setFormData((prev) => ({ ...prev, responses: updatedResponses, invalids: updatedInvalids }));
    };
  
    const getInterpretation = (standardScores) => {
      const entries = Object.entries(standardScores);
      const sorted = [...entries].sort((a, b) => b[1] - a[1]);
      const highest = sorted[0][0];
      const lowest = sorted[sorted.length - 1][0];
      return `El valor más importante es ${highest}. El valor menos enfatizado es ${lowest}.`;
    };
  
    const calculateScores = () => {
      const traits = {
        Verdad: [1, 7, 13, 19, 25],
        Rectitud: [2, 8, 14, 20, 26],
        Paz: [3, 9, 15, 21, 27],
        Amor: [4, 10, 16, 22, 28],
        "No violencia": [5, 11, 17, 23, 29],
      };
  
      const directScores = {
        Verdad: 0,
        Rectitud: 0,
        Paz: 0,
        Amor: 0,
        "No violencia": 0,
      };
  
      Object.keys(traits).forEach((trait) => {
        traits[trait].forEach((qIndex) => {
          const answer = formData.responses[qIndex - 1];
          const a = parseInt(answer.a) || 0;
          const b = parseInt(answer.b) || 0;
          directScores[trait] += a + b;
        });
      });
  
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
  
      const standardScores = {};
      Object.keys(directScores).forEach((trait) => {
        const z = (directScores[trait] - nationalAverages[trait]) / standardDevs[trait];
        standardScores[trait] = Math.round(z * 10 + 50);
      });
  
      const interpretation = getInterpretation(standardScores);
      setResults({ directScores, standardScores, interpretation });
  
      const canvas = document.getElementById("radar-chart-valanti");
      if (canvas) {
        const ctx = canvas.getContext("2d");
        if (window.radarChart) window.radarChart.destroy();
        window.radarChart = new ChartJS(ctx, {
          type: "radar",
          data: {
            labels: Object.keys(standardScores),
            datasets: [
              {
                label: formData.name || "Resultado",
                data: Object.values(standardScores),
                backgroundColor: "rgba(30, 64, 175, 0.2)",
                borderColor: "#1e40af",
                pointBackgroundColor: "#1e40af",
              }
            ]
          },
          options: {
            responsive: false,
            scales: {
              r: {
                beginAtZero: true,
                max: 100
              }
            },
            plugins: {
              legend: {
                position: "top"
              },
              title: {
                display: true,
                text: "Perfil valoral, cuestionario VALANTI"
              }
            }
          }
        });
      }
    };
    const handleSubmit = () => {
        const hasEmpty = formData.responses.some(r => r.a === "" || r.b === "");
        const hasInvalid = formData.invalids.some(i => i);
        if (hasEmpty || hasInvalid) {
          alert("Por favor complete todos los campos correctamente antes de continuar.");
          return;
        }
        calculateScores();
      };
    
      const handleDownloadPDF = () => {
        const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    
        pdf.setFontSize(12);
        pdf.text("Hoja de Resultados - Cuestionario VALANTI", 10, 15);
    
        pdf.setFontSize(10);
        pdf.text(`Nombre: ${formData.name}`, 10, 25);
        pdf.text(`Edad: ${formData.age}`, 100, 25);
        pdf.text(`Sexo: ${formData.sex}`, 10, 32);
        pdf.text(`Educación: ${formData.education}`, 100, 32);
        pdf.text(`Cargo: ${formData.position}`, 10, 39);
    
        let y = 50;
        pdf.setFontSize(9);
        pdf.text("Ítems (A/B):", 10, y);
    
        formData.responses.forEach((resp, i) => {
          const text = `${i + 1}. ${resp.a} / ${resp.b}`;
          const offset = (i % 2 === 0) ? 10 : 100;
          pdf.text(text, offset, y);
          if (i % 2 !== 0) y += 6;
        });
    
        y += 10;
        pdf.setFontSize(10);
        pdf.text("Puntajes por Valor", 10, y);
        y += 6;
        Object.entries(results.directScores).forEach(([valor, puntaje]) => {
          pdf.text(`${valor}: Puntaje directo: ${puntaje}, estándar: ${results.standardScores[valor]}`, 10, y);
          y += 6;
        });
    
        y += 6;
        pdf.text("Interpretación:", 10, y);
        y += 6;
        const splitText = pdf.splitTextToSize(results.interpretation, 180);
        pdf.text(splitText, 10, y);
    
        const canvasRadar = document.getElementById("radar-chart-valanti");
        if (canvasRadar) {
          html2canvas(canvasRadar).then((radarCanvas) => {
            const imgRadar = radarCanvas.toDataURL("image/png");
            pdf.addPage();
            pdf.setFontSize(12);
            pdf.text("Perfil valoral, cuestionario VALANTI", 10, 15);
            pdf.addImage(imgRadar, "PNG", 25, 25, 160, 120);
            pdf.save("valanti-resultados.pdf");
          });
        } else {
          pdf.save("valanti-resultados.pdf");
        }
      };
    
      return (
        <div className="max-w-4xl mx-auto p-4 font-serif text-gray-800">
          <Card className="mb-4 shadow-lg border border-gray-300">
            <CardContent>
              <h2 className="text-2xl font-bold mb-4 text-center uppercase tracking-wide">
                Cuestionario VALANTI
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <Input name="name" placeholder="Nombre" onChange={handleInputChange} />
                <Input name="age" placeholder="Edad" onChange={handleInputChange} />
                <Input name="sex" placeholder="Sexo" onChange={handleInputChange} />
                <Input name="education" placeholder="Educación" onChange={handleInputChange} />
                <Input name="position" placeholder="Cargo" onChange={handleInputChange} />
              </div>
            </CardContent>
          </Card>
    
          <Card className="mb-4 shadow-md border border-gray-300">
            <CardContent>
              <h2 className="text-lg font-semibold mb-2">Respuestas del cuestionario</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {formData.responses.map((resp, idx) => (
                  <div key={idx} className="flex flex-col">
                    <label className="text-sm font-medium">
                      {idx + 1}. {preguntas[idx][0]} / {preguntas[idx][1]}
                    </label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        type="number"
                        min="0"
                        max="3"
                        placeholder="A"
                        value={resp.a}
                        className={formData.invalids[idx] ? 'border-red-500 ring-red-500 focus-visible:ring-red-500' : ''}
                        onChange={(e) => handleResponseChange(idx, "a", e.target.value)}
                      />
                      <Input
                        type="number"
                        placeholder="B"
                        value={resp.b}
                        readOnly
                      />
                    </div>
                    {formData.invalids[idx] && (
                      <span className="text-red-600 text-xs mt-1">Valor inválido. Debe ser entre 0 y 3.</span>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
    
          <div className="text-center mb-6">
            <Button
              onClick={handleSubmit}
              disabled={formData.invalids.some(i => i) || formData.responses.some(r => r.a === "" || r.b === "")}
              className="disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Calcular y mostrar resultados
            </Button>
          </div>
    
          {results && (
            <div ref={resultRef} className="text-base">
              <Card className="mt-6 border border-gray-400 shadow-md">
                <CardContent>
                  <h2 className="text-xl font-semibold mb-4 text-center">Resumen de resultados</h2>
                  <div className="grid grid-cols-2 gap-4">
                    {Object.keys(results.directScores).map((trait) => (
                      <div key={trait}>
                        <p className={labelStyle}>{trait}</p>
                        <p className={valueStyle}>Puntaje directo: {results.directScores[trait]}</p>
                        <p className={valueStyle}>Puntaje estándar: {results.standardScores[trait]}</p>
                      </div>
                    ))}
                  </div>
                  <p className="mt-4 italic text-sm text-center">{results.interpretation}</p>
                  <div className="mt-6">
                    <Bar
                      data={{
                        labels: Object.keys(results.standardScores),
                        datasets: [
                          {
                            label: "Puntajes Estándar",
                            data: Object.values(results.standardScores),
                            backgroundColor: "#1d4ed8",
                          },
                        ],
                      }}
                      options={{
                        responsive: true,
                        plugins: {
                          legend: { display: false },
                          title: { display: true, text: "Perfil VALANTI", font: { size: 18 } },
                        },
                        scales: {
                          y: {
                            beginAtZero: true,
                            max: 100,
                          },
                        },
                      }}
                    />
                  </div>
                  <div className="mt-6">
                    <canvas id="radar-chart-valanti" width="400" height="400"></canvas>
                  </div>
                  <div className="text-center mt-6">
                    <Button onClick={handleDownloadPDF}>Descargar PDF</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      );
    };
    
    export default ValantiApp;
      