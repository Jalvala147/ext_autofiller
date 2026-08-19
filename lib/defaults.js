const PF_DEFAULTS = {
  locale: "mx",
  gender: "random",
  overwrite: true,
  passwordMode: "fixed",
  fixedPassword: "Prueba123!",
  passwordLength: 12,
  emailFormat: "name.surname",
  usernameFormat: "name.surname",
  domains: ["example.test", "mailinator.com", "yopmail.com", "inbox.test"],
  maleNames: [
    "Alejandro", "Andrés", "Ángel", "Antonio", "Arturo", "Bruno", "Carlos",
    "César", "Daniel", "David", "Diego", "Eduardo", "Emilio", "Enrique",
    "Fernando", "Francisco", "Gabriel", "Gerardo", "Guillermo", "Héctor",
    "Hugo", "Ignacio", "Iván", "Javier", "Jorge", "José", "Juan", "Luis",
    "Manuel", "Marco", "Mario", "Miguel", "Nicolás", "Oscar", "Pablo",
    "Pedro", "Rafael", "Ricardo", "Roberto", "Santiago", "Sergio", "Tomás",
    "Vicente", "Víctor"
  ],
  femaleNames: [
    "Alejandra", "Alicia", "Ana", "Andrea", "Beatriz", "Camila", "Carmen",
    "Carolina", "Claudia", "Cristina", "Daniela", "Diana", "Elena", "Emilia",
    "Fernanda", "Gabriela", "Isabel", "Jimena", "Laura", "Lucía", "Luisa",
    "Mariana", "Marta", "Mónica", "Natalia", "Paola", "Patricia", "Paula",
    "Regina", "Rosa", "Sandra", "Sara", "Sofía", "Teresa", "Valentina",
    "Valeria", "Verónica", "Victoria", "Ximena"
  ],
  lastNames: [
    "García", "González", "Rodríguez", "Fernández", "López", "Martínez",
    "Sánchez", "Pérez", "Gómez", "Hernández", "Jiménez", "Ruiz", "Díaz",
    "Álvarez", "Moreno", "Muñoz", "Romero", "Alonso", "Gutiérrez", "Navarro",
    "Torres", "Domínguez", "Vázquez", "Ramos", "Ramírez", "Serrano", "Blanco",
    "Molina", "Morales", "Ortega", "Delgado", "Castro", "Ortiz", "Rubio",
    "Marín", "Núñez", "Iglesias", "Medina", "Suárez", "Rojas", "Mendoza",
    "Aguilar", "Vargas", "Cruz", "Flores", "Rivera", "Reyes", "Guerrero",
    "Méndez", "Herrera"
  ],
  streets: [
    "Av. Insurgentes Sur", "Calle Morelos", "Av. Reforma", "Calle Hidalgo",
    "Av. Universidad", "Calle Juárez", "Av. Constitución", "Calle Independencia",
    "Av. Tecnológico", "Calle Allende", "Av. Central", "Calle Zaragoza",
    "Av. Las Palmas", "Calle 5 de Mayo", "Av. México", "Calle Madero"
  ],
  customFields: [],
  extra: {
    company: "",
    website: "",
    jobTitle: ""
  }
};

const PF_PLACES = {
  mx: {
    country: "México",
    countryCode: "MX",
    phonePrefix: "+52",
    postalDigits: 5,
    regions: [
      { state: "Ciudad de México", cities: ["Ciudad de México", "Coyoacán", "Benito Juárez", "Miguel Hidalgo"] },
      { state: "Jalisco", cities: ["Guadalajara", "Zapopan", "Tlaquepaque", "Tonalá"] },
      { state: "Nuevo León", cities: ["Monterrey", "San Pedro Garza García", "Guadalupe", "Apodaca"] },
      { state: "Puebla", cities: ["Puebla", "Cholula", "Atlixco"] },
      { state: "Yucatán", cities: ["Mérida", "Valladolid", "Progreso"] },
      { state: "Querétaro", cities: ["Santiago de Querétaro", "San Juan del Río"] },
      { state: "Guanajuato", cities: ["León", "Guanajuato", "Celaya", "Irapuato"] },
      { state: "Baja California", cities: ["Tijuana", "Mexicali", "Ensenada"] }
    ]
  },
  es: {
    country: "España",
    countryCode: "ES",
    phonePrefix: "+34",
    postalDigits: 5,
    regions: [
      { state: "Madrid", cities: ["Madrid", "Alcalá de Henares", "Móstoles", "Getafe"] },
      { state: "Cataluña", cities: ["Barcelona", "Hospitalet", "Badalona", "Sabadell"] },
      { state: "Andalucía", cities: ["Sevilla", "Málaga", "Granada", "Córdoba"] },
      { state: "Comunidad Valenciana", cities: ["Valencia", "Alicante", "Castellón"] },
      { state: "País Vasco", cities: ["Bilbao", "Vitoria-Gasteiz", "San Sebastián"] }
    ]
  },
  ar: {
    country: "Argentina",
    countryCode: "AR",
    phonePrefix: "+54",
    postalDigits: 4,
    regions: [
      { state: "Buenos Aires", cities: ["Buenos Aires", "La Plata", "Mar del Plata"] },
      { state: "Córdoba", cities: ["Córdoba", "Villa Carlos Paz"] },
      { state: "Santa Fe", cities: ["Rosario", "Santa Fe"] },
      { state: "Mendoza", cities: ["Mendoza", "Godoy Cruz"] }
    ]
  },
  co: {
    country: "Colombia",
    countryCode: "CO",
    phonePrefix: "+57",
    postalDigits: 6,
    regions: [
      { state: "Cundinamarca", cities: ["Bogotá", "Soacha", "Chía"] },
      { state: "Antioquia", cities: ["Medellín", "Envigado", "Bello"] },
      { state: "Valle del Cauca", cities: ["Cali", "Palmira"] },
      { state: "Atlántico", cities: ["Barranquilla", "Soledad"] }
    ]
  },
  us: {
    country: "United States",
    countryCode: "US",
    phonePrefix: "+1",
    postalDigits: 5,
    regions: [
      { state: "California", cities: ["Los Angeles", "San Francisco", "San Diego", "San Jose"] },
      { state: "New York", cities: ["New York", "Brooklyn", "Buffalo"] },
      { state: "Texas", cities: ["Austin", "Houston", "Dallas"] },
      { state: "Florida", cities: ["Miami", "Orlando", "Tampa"] },
      { state: "Washington", cities: ["Seattle", "Tacoma", "Bellevue"] }
    ]
  }
};

const PF_JOBS = [
  "QA Analyst", "Product Designer", "Frontend Developer", "Data Analyst",
  "Project Manager", "Customer Success", "Operations Lead", "Marketing Specialist"
];

const PF_COMPANIES = [
  "Norte Labs", "Sierra Digital", "Atlas QA", "Pino Studio", "Delta Pruebas",
  "Orbita Soft", "Luna Systems", "Cobre Apps"
];
