
import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const useVenues = () => {
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVenues = async () => {
      const { data, error } = await supabase
        .from('venues')
        .select(`
          id,
          name,
          description,
          mode,
          category,
          area,
          image_url,
          venue_tags ( tags ( id, name ) )
        `);

      if (error) {
        setError(error);
      } else {
        const formatted = data.map(v => ({
          ...v,
          tags: v.venue_tags.map(vt => vt.tags.name),
        }));
        setVenues(formatted);
      }
      setLoading(false);
    };

    fetchVenues();
  }, []);

  return { venues, loading, error };
};

export default useVenues;