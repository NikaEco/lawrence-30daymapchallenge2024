import { Database } from 'duckdb';

export async function GET() {
  const db = new Database(':memory:');
    
  db.exec('INSTALL spatial;');
  db.exec('LOAD spatial;');
  
  const query = `
    SELECT
        id, names, categories, geometry
    FROM read_parquet('s3://overturemaps-us-west-2/release/2024-08-20.0/theme=places/type=place/*', filename=true, hive_partitioning=1)
    LIMIT 10
  `;

  const buildings = db.all(query,
    (err, res) => {
      if (err) {
        console.log("Error", err);
      } else {
        console.table(res);
      }
    });

    console.log(buildings)

//     return Response.json({
//         type: 'FeatureCollection',
//         features: buildings.map(b => ({
//             type: 'Feature',
//             geometry: b.geometry,
//             properties: {
//                 id: b.id,
//                 names: b.names,
//                 categories: b.categories
//             }
//     }))
//   });
}