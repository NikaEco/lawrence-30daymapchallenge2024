'use client';

import Link from 'next/link'
import Image from 'next/image'

const mapChallengeData = [
  { date: "01-11-2024", name: "Points", description: "A map with points. Start the challenge with points. Show individual locations—anything from cities to trees or more abstract concepts.", emoji: "📍", linkedinLink: "https://www.linkedin.com/posts/xdl_30daymapchallenge-python-activity-7258133127242358784-nWth?utm_source=share&utm_medium=member_desktop" },
  { date: "02-11-2024", name: "Lines", description: "A map with focus on lines. Roads, rivers, routes, or borders—this day is all about mapping connections and divisions.", emoji: "📏", linkedinLink: "https://www.linkedin.com/posts/xdl_turkey-30daymapchallenge-python-activity-7258456781549391872-ohNP?utm_source=share&utm_medium=member_desktop" },
  { date: "03-11-2024", name: "Polygons", description: "A map with polygons. Regions, countries, lakes—this day is for defined shapes that fill space.", emoji: "🔷", linkedinLink: "https://www.linkedin.com/posts/xdl_30daymapchallenge-python-geospatial-activity-7258844399294455808-Tq8k?utm_source=share&utm_medium=member_desktop" },
  { date: "04-11-2024", name: "Hexagons", description: "Maps using hexagonal grids. Step away from square grids and try mapping with hexagons.", emoji: "🛑", linkedinLink: "https://www.linkedin.com/posts/xdl_h3-30daymapchallenge-geometry-activity-7259225312146698241-qm6E?utm_source=share&utm_medium=member_desktop" },
  { date: "05-11-2024", name: "A journey", description: "Map any journey. Personal or not. Trace a journey—this could be a daily commute, a long-distance trip, or something from history.", emoji: "🚶‍♂️✈️", linkedinLink: "https://www.linkedin.com/posts/xdl_30daymapchallenge-singapore-geojson-activity-7259537323816595456-PLce?utm_source=share&utm_medium=member_desktop" },
  { date: "06-11-2024", name: "Raster", description: "A map using raster data. Rasters are everywhere, but today's focus is purely on grids and pixels.", emoji: "🟦🟧", linkedinLink: "https://www.linkedin.com/posts/xdl_30daymapchallenge-python-geospatial-activity-7259865410504663040-_Iba?utm_source=share&utm_medium=member_desktop" },
  { date: "07-11-2024", name: "Vintage style", description: "Map something modern in a vintage aesthetic. Create a map that captures the look and feel of historical cartography but focuses on a contemporary topic.", emoji: "🕰️🗺️", linkedinLink: "https://www.linkedin.com/posts/xdl_30daymapchallenge-geospatial-datascience-activity-7260233540913504256-i9Zt?utm_source=share&utm_medium=member_desktop" },
  { date: "08-11-2024", name: "Humanitarian Data Exchange (HDX)", description: "Use data from HDX to map humanitarian topics. Explore the datasets from the Humanitarian Data Exchange.", emoji: "🌍🚑", linkedinLink: "https://www.linkedin.com/posts/xdl_30daymapchallenge-python-geospatial-activity-7260606663634616320-yZuC?utm_source=share&utm_medium=member_desktop" },
  { date: "09-11-2024", name: "AI only", description: "This day is all about prompt engineering. Use AI tools like DALL-E, MidJourney, Stable Diffusion, or ChatGPT with geospatial capabilities to create a map.", emoji: "🤖", linkedinLink: "https://www.linkedin.com/posts/xdl_30daymapchallenge-ai-llms-activity-7261030870671581184-VWb7?utm_source=share&utm_medium=member_desktop" },
  { date: "10-11-2024", name: "Pen & paper", description: "Draw a map by hand. Go analog and draw a map using pen and paper.", emoji: "✏️🗺️", linkedinLink: "https://www.linkedin.com/posts/xdl_30daymapchallenge-forest-diversity-activity-7261403929370861568-qusS?utm_source=share&utm_medium=member_desktop" },
  { date: "11-11-2024", name: "Arctic", description: "Map the Arctic. Whether it's ice coverage, wildlife habitats, or the effects of climate change.", emoji: "❄️🧊", linkedinLink: "https://www.linkedin.com/posts/xdl_30daymapchallenge-arctic-python-activity-7261769396862242818-IZZp?utm_source=share&utm_medium=member_desktop" },
  { date: "12-11-2024", name: "Time and space", description: "Map something where time matters. Visualize change over time—urban growth, migration, or environmental shifts.", emoji: "⏳🌍", linkedinLink: "https://www.linkedin.com/posts/xdl_30daymapchallenge-timeseries-amazon-activity-7262142381888593921-FFJW?utm_source=share&utm_medium=member_desktop" },
  { date: "13-11-2024", name: "A new tool", description: "Use a tool you've never tried before. The challenge has always been about trying new things.", emoji: "🧪🔧", linkedinLink: "https://www.linkedin.com/posts/xdl_spatial-analytics-30daymapchallenge-activity-7262486201331273728-QGvq?utm_source=share&utm_medium=member_desktop" },
  { date: "14-11-2024", name: "A world map", description: "Map the whole world. Whether it's continents, ecosystems, or oceans, this is the day to map the entire planet.", emoji: "🌍", linkedinLink: "https://www.linkedin.com/posts/xdl_carbon-30daymapchallenge-python-activity-7262871183673479168-RS-u?utm_source=share&utm_medium=member_desktop" },
  { date: "15-11-2024", name: "My data", description: "Map something personal. Map data from your own life—this could be places you've traveled, your daily routine, or any other personal touch.", emoji: "🗒️", linkedinLink: "" },
  { date: "16-11-2024", name: "Choropleth", description: "Classic choropleth map. Use color to show data variation across regions.", emoji: "🎨", linkedinLink: "" },
  { date: "17-11-2024", name: "Collaborative map", description: "Collaborate with others on a single map. For today's challenge, team up!", emoji: "🤝🗺️", linkedinLink: "" },
  { date: "18-11-2024", name: "3D", description: "Map with depth. Add a third dimension to your map.", emoji: "🎢🏔️", linkedinLink: "" },
  { date: "19-11-2024", name: "Typography", description: "Map focused on typography. Let text and words do the heavy lifting today.", emoji: "✍️🅰️", linkedinLink: "" },
  { date: "20-11-2024", name: "OpenStreetMap", description: "Use OpenStreetMap data to create something. OpenStreetMap offers rich, editable data from roads to buildings and beyond.", emoji: "🗺️📍", linkedinLink: "" },
  { date: "21-11-2024", name: "Conflict", description: "Map a conflict. Political, territorial, or social—there are conflicts all around us.", emoji: "⚔️🛑", linkedinLink: "" },
  { date: "22-11-2024", name: "2 colours", description: "Create a map using only 2 colors. No gradients or shading—just two flat colors.", emoji: "🎨🎨", linkedinLink: "" },
  { date: "23-11-2024", name: "Memory", description: "Map based on memory. Create a map of a place you remember—hometown, favorite destination, or somewhere meaningful.", emoji: "💭🗺️", linkedinLink: "" },
  { date: "24-11-2024", name: "Only circular shapes", description: "Map using only circles. Everything should be circular.", emoji: "🔵⭕", linkedinLink: "" },
  { date: "25-11-2024", name: "Heat", description: "Map something related to heat. Focus on heat, whether it's actual temperature or areas of intensity.", emoji: "🔥🌡️", linkedinLink: "" },
  { date: "26-11-2024", name: "Map projections", description: "Explore different map projections and how they distort the world.", emoji: "🌐", linkedinLink: "" },
  { date: "27-11-2024", name: "Micromapping", description: "Map something small and precise. Zoom in and map a small area in high detail.", emoji: "🧐🔍", linkedinLink: "" },
  { date: "28-11-2024", name: "The blue planet", description: "Map oceans, rivers, and lakes. Focus on water today.", emoji: "🌊🐋", linkedinLink: "" },
  { date: "29-11-2024", name: "Overture", description: "Use data from the Overture Maps Foundation. Explore data from Overture Maps Foundation to create a map that highlights new geographic datasets.", emoji: "🌍📊", linkedinLink: "" },
  { date: "30-11-2024", name: "The final map", description: "The final challenge—your choice! Revisit a technique from earlier in the month, refine an idea, or try something completely new.", emoji: "🎉🌐", linkedinLink: "" },
]

function GradientPlaceholder({ day, name, description, emoji }: { day: number; name: string; description: string; emoji: string }) {
  return (
    <div className="h-48 bg-gradient-to-br from-blue-400 to-purple-500 animate-gradient-x flex flex-col items-center justify-center p-4 text-white">
      <p className="text-3xl mb-2">{emoji}</p>
      <p className="text-xl font-bold text-center mb-1">Day {day}: {name}</p>
      <p className="text-sm text-center line-clamp-3">{description}</p>
    </div>
  )
}

function MapCard({ day, name, description, emoji, linkedinLink }: { day: number; name: string; description: string; emoji: string; linkedinLink: string }) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 ease-in-out transform hover:scale-105 group">
      <Link href={`/maps/day-${day}`}>
        <div className="relative h-48">
          {/* Show gradient by default */}
          <div className="absolute inset-0 z-10 group-hover:opacity-0 transition-opacity duration-300">
            <GradientPlaceholder day={day} name={name} description={description} emoji={emoji} />
          </div>
          {/* Image underneath, visible on hover */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Image
              src={`/images/day-${day}.jpg`}
              alt={`'Preview unavailable`}
              layout="fill"
              objectFit="cover"
              className="text-black"
            />
          </div>
        </div>
      </Link>
      <div className="p-4">
        <div className="flex justify-between items-start">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center">
            <span className="mr-2">{emoji}</span>
            Day {day}: {name}
          </h2>
          {linkedinLink && (
            <a href={linkedinLink} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-600">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854V1.146zm4.943 12.248V6.169H2.542v7.225h2.401zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248-.822 0-1.359.54-1.359 1.248 0 .694.521 1.248 1.327 1.248h.016zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016a5.54 5.54 0 0 1 .016-.025V6.169h-2.4c.03.678 0 7.225 0 7.225h2.4z"/>
              </svg>
            </a>
          )}
        </div>
        <p className="text-gray-600 mt-2 line-clamp-2">{description}</p>
      </div>
    </div>
  )
}

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Nika&apos;s 30 Day Map Challenge 2024
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Join Lawrence 
            <a href='https://www.linkedin.com/in/xdl' target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-600 inline-flex items-center ml-2">
              <svg className="w-6 h-6 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854V1.146zm4.943 12.248V6.169H2.542v7.225h2.401zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248-.822 0-1.359.54-1.359 1.248 0 .694.521 1.248 1.327 1.248h.016zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016a5.54 5.54 0 0 1 .016-.025V6.169h-2.4c.03.678 0 7.225 0 7.225h2.4z"/>
              </svg>
            </a>
            , co-founder of
            <a href='https://nika.eco' target="_blank" rel="noopener noreferrer" className='text-blue-500 hover:text-blue-600'> Nika</a>
            , a geospatial software company, on this exciting 30-day journey. 
          </p>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mt-4">
            Lawrence will use Generative AI, DeckGL, DuckDB, and Python to create fascinating maps that showcase the 
            power of AI in geospatial visualization and analysis.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {mapChallengeData.map((day, index) => (
            <MapCard
              key={index}
              day={index + 1}
              name={day.name}
              description={day.description}
              emoji={day.emoji}
              linkedinLink={day.linkedinLink}
            />
          ))}
        </div>
      </div>
    </div>
  )
}