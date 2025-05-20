// Componente principal de la App
import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

const labelStyle = "font-semibold text-gray-700 block mb-1";
const inputStyle = "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50";

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
  ["Ser desagradecido con los que ayudan", "Ser Egoísta con todos"],
  ["Cualquier forma de irrespeto", "odiar"]
];

const ValantiApp = () => {
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    sex: "",
    education: "",
    position: "",
    responses: Array.from({ length: preguntas.length }, () => ({ a: "", b: "" })),
    invalids: Array.from({ length: preguntas.length }, () => false),
  });

  const [results, setResults] = useState(null);
  const chartRef = useRef(null);
  const resultsCardRef = useRef(null);

  // Dibuja el gráfico cuando cambian los resultados
  useEffect(() => {
    if (results && chartRef.current) {
      const ctx = chartRef.current.getContext("2d");
      if (window.radarChartValanti instanceof ChartJS) {
        window.radarChartValanti.destroy();
      }
      window.radarChartValanti = new ChartJS(ctx, {
        type: "radar",
        data: {
          labels: Object.keys(results.standardScores),
          datasets: [
            {
              label: formData.name || "Resultado",
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
    // Limpia el gráfico al desmontar o actualizar
    return () => {
      if (window.radarChartValanti instanceof ChartJS) {
        window.radarChartValanti.destroy();
      }
    };
  }, [results, formData.name]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSelectChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
  };

  // Corrige lógica y firma
  const handleResponseChange = (index, field, value) => {
    let numValue = parseInt(value, 10);
    const updatedInvalids = [...formData.invalids];
    const updatedResponses = [...formData.responses];

    if (isNaN(numValue) || numValue < 0 || numValue > 3) {
      updatedInvalids[index] = true;
    } else {
      updatedInvalids[index] = false;
      if (field === "a") {
        updatedResponses[index] = {
          a: numValue.toString(),
          b: (3 - numValue).toString()
        };
      } else if (field === "b") {
        updatedResponses[index] = {
          b: numValue.toString(),
          a: (3 - numValue).toString()
        };
      }
    }
    setFormData((prev) => ({ ...prev, responses: updatedResponses, invalids: updatedInvalids }));
  };

  const getInterpretation = (standardScores) => {
    const entries = Object.entries(standardScores);
    const validEntries = entries.filter(([key, value]) => typeof value === 'number' && !isNaN(value));

    if (validEntries.length === 0) {
      return "No hay datos suficientes para generar una interpretación.";
    }

    const sorted = [...validEntries].sort(([, valA], [, valB]) => valB - valA);
    const highest = sorted[0][0];
    const lowest = sorted[sorted.length - 1][0];
    return `El valor más importante es ${highest}. El valor menos enfatizado es ${lowest}.`;
  };

  const calculateScores = () => {
    const traits = {
      Verdad: [1, 7, 13, 19, 25],
      Rectitud: [2, 8, 14, 20, 26],
      Paz: [3, 9, 15, 21, 27],
      Amor: [4, 10, 16
