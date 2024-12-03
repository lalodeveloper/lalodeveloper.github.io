// Función para generar colores aleatorios
function getRandomColor() {
  return `hsl(${Math.floor(Math.random() * 360)}, 70%, 50%)`;
}

// Consumir API y generar el gráfico
fetch("http://localhost:3000/puntos/carreras")
  .then((response) => response.json())
  .then((data) => {
    // Extraer las carreras y usuarios
    const carreras = [...new Set(data.map((item) => item.carrera))];
    const usuarios = [...new Set(data.map((item) => item.usuario))];

    // Crear datasets para cada usuario
    const datasets = usuarios.map((usuario) => {
      return {
        label: usuario,
        data: carreras.map((carrera) => {
          const entry = data.find(
            (d) => d.carrera === carrera && d.usuario === usuario
          );
          return entry ? entry.puntos : 0; // Asignar 0 si no hay puntos
        }),
        borderColor: getRandomColor(),
        borderWidth: 2,
        fill: false,
      };
    });

    // Configuración del gráfico
    const ctx = document.getElementById("myChart").getContext("2d");
    new Chart(ctx, {
      type: "line",
      data: {
        labels: carreras,
        datasets: datasets,
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: "top",
          },
          tooltip: {
            mode: "index",
            intersect: false,
          },
        },
        interaction: {
          mode: "nearest",
          axis: "x",
          intersect: false,
        },
        scales: {
          x: {
            title: {
              display: true,
              text: "Carreras",
            },
          },
          y: {
            title: {
              display: true,
              text: "Puntos",
            },
            beginAtZero: true,
          },
        },
      },
    });
  })
  .catch((error) => console.error("Error al cargar los datos:", error));
