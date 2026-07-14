import { useState, useEffect } from "react"
import { supabase } from './supabaseClient'

const Nookpick = () => {
  const [pickVenues, setPickVenues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getPick = async () => {
        const {data, error} = await supabase
        .from('venues')
        .select(`*, venue_tags(tags(id, name))`)
        .in('slug', ['miyako-sushi', 'kohi-by-ifuku']);

        if(!error) {
            const formatted = data.map(v => ({
                ...v,
                tags:v.venue_tags.map(vt => vt.tags.name),
            }));
            setPickVenues(formatted);
        }
        setLoading(false);
    };
    getPick();
  }, []);

  if (loading) return <p>Loading Picks...</p>
  if (pickVenues.length === 0) return null;

  return(

   

    <div className="wrapper">
         <h1 className="pickHeader">Nook Picks</h1>

        <div className="pickContainer">

        {pickVenues.map(venue => (
            <div key={venue.id} className="nookPickCard">
                <div className="pickInfo">
                <h3>{venue.name}</h3>
                <p>{venue.area}, {venue.city}</p>
                <div className="nookPickTags">
                    {venue.tags.slice(3, 6).map((tag, i) => (
                        <span  key={i} className="nookPickTag">{tag}</span>
                    
                    ))}
                    </div>
                </div>
            </div>
        ))}
    </div>
    </div>
  )
}

export default Nookpick;