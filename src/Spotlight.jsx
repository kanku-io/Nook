import { useState, useEffect } from "react"
import { supabase } from './supabaseClient'


const Spotlight = () => {
 const [spotlightVenue, setSpotlightVenue] = useState(null);
 const [loading, setLoading] = useState(true);

 useEffect(() => {
    const getSpotlight = async () => {
        const {data, error} = await supabase
        .from('venues')
        .select(`*, venue_tags (tags (id, name))`)
        .eq('slug', 'acai-republic')
        .single();

        if(!error) {
            const formatted = {
                ...data,
                tags:data.venue_tags.map(vt => vt.tags.name),

            };
            setSpotlightVenue(formatted);
        }
        setLoading(false);
    };

    getSpotlight();
 }, []);

 if (loading) return <p>Loading Spotlight...</p>
 if (!spotlightVenue) return null;

 return(
    <div className="spotlightContainer">
        <p className="spotlightBadge">Spotlight of the week</p>
        <div className="spotlightInfo">
        <h2>{spotlightVenue.name}</h2>
        <p>{spotlightVenue.category} | {spotlightVenue.address}</p>
        
        <div className="spotlightTags">
            {spotlightVenue.tags.slice(0, 3).map((tag, i) => (
                <span key={i} className="spotlightTag">{tag}</span>
            ))}
        </div>
        </div>
    </div>
 )

}

export default Spotlight;