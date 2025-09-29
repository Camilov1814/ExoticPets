Clase 1


![[Pasted image 20250709181413.png]]

Una maquina virtual en azure, o EC2 en aws , son IaaS, se entra al linux y se puede tener mas control sobre lo azul, S3 es un SaaS es un servicio de amazon para guardar archivos , se crean buckets y en eso se mete todo. No es una base de datos, es de archvios (?) Que es ORM 


| Modelo | Da                          | ¿Quién lo gestiona?                 | Ejemplos                            |
| ------ | --------------------------- | ----------------------------------- | ----------------------------------- |
| IaaS   | Infraestructura (VMs, red)  | Usuario gestiona SO y apps          | EC2,  GCE, Azure VM                 |
| PaaS   | Plataforma para desarrollar | Usuario gestiona solo su aplicación | Firebase, Heroku, App Engine        |
| SaaS   | Software listo para usar    | El proveedor gestiona todo          | Gmail, Google Docs, Zoom, Canva, S3 |

Arquitectura
![[Pasted image 20250709183639.png]]

No todas las aplicaciones necesitan Arquitectos de datos , eso depende de la app, tamano, complejidad y escalamiento, aplicaciones como startups, donde se requiere control de los datos (calidad), seguridad , escalabilidad las mas grandes tambien obvio , ese era el limite.
Tambien permite que este en constante evolucion mediant ele conocimiento de DevOps
![[Pasted image 20250709185110.png]]

Azure en defensa permite esto

Microsoft ofrece su arquitectura, 
![[Pasted image 20250709185310.png]]
Esto es Blue Team, arquiteco de ciberseguridad: Un **arquitecto de ciberseguridad** es el que **diseña las defensas desde el principio** para que toda la infraestructura esté protegida desde su base.

## Atributos De Calidad
### Mantenibilidad
### Seguridad (CIA)

### Escalamiento 
Escalar significa aumentar la capacidad de un sistema para manejar mas carga , es dcir usuarios, datos , peticiones estan:
- Escalamiento Vertical: Aumentar los recursos desde un solo servidor, las necesidades son pequenas, EC2 por ejemplo permite esto, solo permite un punto , mas riesgo de que todo falle y tiene limite fisico, esto es un monolito
- Escalamiento Horizontal: Agregar mas serivdores que trabajen en paralelo, bueno para apps web, microservicios



Usanbilidad

### Disponibilidad:
Si un servicio estuvo disponible 364 días de 365, su disponibilidad fue:

$$
\left( \frac{364}{365} \right) \times 100 \approx 99.73\%
$$
### Portabilidad
**Portabilidad** es la capacidad de un sistema, software o servicio para **moverse y funcionar en diferentes entornos** sin necesidad de grandes cambios.

La carga de una pagina se debe demorar menos de 200 mill/segs, se califica mal y el performance esta dentro de la escalabilidad



Usabilidad y Seguridad son contrarios y mantenibilidad  y disponibilidad. Son aplicaciones malas pero pueden ser portables e ir a cualquier lado. 

### Mantenibilidad
DevOps ayuda a que los proyectos sean agiles, entonces tiene que ver
La **mantenibilidad** depende de que el sistema esté **bien estructurado, documentado, probado y modularizado**, para que cualquier cambio sea **rápido, seguro y entendible**.

| Caso / tipo de carga                                                               | Prioridad típica         | ¿Por qué?                                                                  |
| ---------------------------------------------------------------------------------- | ------------------------ | -------------------------------------------------------------------------- |
| **Aplicaciones con cálculos intensivos** (simulaciones, IA, cifrado, compresión)   | **Procesador (CPU/GPU)** | Necesitan alto poder de cómputo.                                           |
| **Aplicaciones en memoria** (caches, analítica, servidores web)                    | **Memoria (RAM)**        | Si no hay suficiente RAM, el sistema se vuelve lento o crashea.            |
|  **Aplicaciones con lectura/escritura intensiva** (bases de datos, backups, video) | **Disco (I/O)**          | Necesitan leer y escribir datos rápido (velocidad de disco y tipo cuenta). |
Trade Off de Arquitectura
Se debe sacrificar algo para ganar algo mas
Elegir bien depende del **contexto, requerimientos del sistema y objetivos del negocio.**

| Decisión                              | Qué ganas                         | Qué pierdes (trade-off)                       |
| ------------------------------------- | --------------------------------- | --------------------------------------------- |
| Usar una **base de datos relacional** | Integridad y consistencia         | Menor escalabilidad horizontal                |
| Usar **NoSQL (ej. MongoDB)**          | Escalabilidad y flexibilidad      | Menor consistencia fuerte                     |
| **Escalar verticalmente**             | Simplicidad                       | Límite físico y alto costo por unidad         |
| **Escalar horizontalmente**           | Escalabilidad, disponibilidad     | Mayor complejidad técnica                     |
| Guardar todo en **memoria (RAM)**     | Rapidez                           | Riesgo de pérdida de datos si no se guarda    |
| Usar **microservicios**               | Modularidad, despliegues aislados | Mayor complejidad de comunicación y seguridad |
| **Cifrado fuerte**                    | Seguridad                         | Mayor uso de CPU y latencia                   |

### S3
No se cobra la carga de informacion, se cobra por descarga y almacenamiento 20 usd/ TB/ Month y en procesamiento 6usd/Tera


Server side rendering, se genera el html antes de mandarlo al browser del ususario 

Temperatura de datos, mientras mas se muevan los datos mayor velocidad necesita


{/* Partículas temáticas */}

              {category.particles.map((particle, i) => (

                <div

                  key={i}

                  className={`absolute text-lg opacity-0 group-hover:opacity-60 transition-all duration-500 pointer-events-none ${

                    hoveredCategory === index ? 'animate-float' : ''

                  }`}

                  style={{

                    left: `${20 + i * 25}%`,

                    top: `${10 + i * 15}%`,

                    animationDelay: `${i * 0.3}s`,

                  }}

                >

                  {particle}

                </div>

              ))}

  

              {/* Icono principal */}

              <div className="mb-6 text-center">

                <div className="mb-4 text-6xl transition-all duration-500 group-hover:animate-bounce-soft group-hover:scale-110 filter drop-shadow-lg">

                  {category.icon}

                </div>

                {/* Badge de contador */}

                <div className="inline-block px-4 py-2 border rounded-full bg-gradient-to-r from-nature-600/20 to-nature-500/20 backdrop-blur-sm border-nature-500/30">

                  <span className="text-sm font-semibold text-nature-400">{category.count}</span>

                </div>

              </div>





{/* Efecto de brillo */}

              <div className="absolute inset-0 transition-opacity duration-500 opacity-0 pointer-events-none bg-gradient-to-br from-nature-500/5 to-transparent rounded-2xl group-hover:opacity-100"></div>

              {/* Indicator de actividad */}

              {hoveredCategory === index && (

                <div className="absolute transform -translate-x-1/2 bottom-4 left-1/2">

                  <div className="w-2 h-2 rounded-full bg-nature-500 animate-ping"></div>

                </div>

              )}