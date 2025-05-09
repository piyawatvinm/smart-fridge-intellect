import { supabase } from '@/integrations/supabase/client';

export const initializeAppData = async (userId: string | null) => {
  if (!userId) {
    console.log('User not logged in, skipping data initialization.');
    return;
  }

  try {
    // Initialize stores
    await initializeStores(userId);
  } catch (error) {
    console.error('Error initializing stores data:', error);
  }
};

export const initializeStores = async (userId: string) => {
  try {
    console.log('Initializing stores data...');
    
    const storeData = [
      { 
        name: 'Makro', 
        location: 'Bangkok, Thailand',
        logo_url: '/placeholder.svg',
        address: 'Rama IV Road, Bangkok',  // Added required address field
        user_id: userId 
      },
      { 
        name: 'Lotus', 
        location: 'Multiple locations in Thailand',
        logo_url: '/placeholder.svg',
        address: 'Sukhumvit Road, Bangkok',
        user_id: userId 
      },
      { 
        name: 'BigC', 
        location: 'Nationwide, Thailand',
        logo_url: '/placeholder.svg',
        address: 'Ratchadamri, Bangkok',
        user_id: userId 
      },
      { 
        name: 'Villa Market', 
        location: 'Bangkok, Thailand',
        logo_url: '/placeholder.svg',
        address: 'Sukhumvit 33, Bangkok',
        user_id: userId 
      },
      { 
        name: 'Tops', 
        location: 'Bangkok, Thailand',
        logo_url: '/placeholder.svg',
        address: 'Central World, Bangkok',
        user_id: userId 
      },
      { 
        name: 'Foodland', 
        location: 'Bangkok, Thailand',
        logo_url: '/placeholder.svg',
        address: 'Sukhumvit 16, Bangkok',
        user_id: userId 
      },
      { 
        name: 'Gourmet Market', 
        location: 'Bangkok, Thailand',
        logo_url: '/placeholder.svg',
        address: 'EmQuartier, Bangkok',
        user_id: userId 
      },
      { 
        name: '7-Eleven', 
        location: 'Nationwide, Thailand',
        logo_url: '/placeholder.svg',
        address: 'Multiple locations',
        user_id: userId 
      },
      { 
        name: 'Tesco', 
        location: 'Bangkok, Thailand',
        logo_url: '/placeholder.svg',
        address: 'Rama III, Bangkok',
        user_id: userId 
      },
      { 
        name: 'CJ Express', 
        location: 'Bangkok, Thailand',
        logo_url: '/placeholder.svg',
        address: 'Wireless Road, Bangkok',
        user_id: userId 
      }
    ];

    // Insert all store records
    const { data: insertedStores, error } = await supabase
      .from('stores')
      .insert(storeData)
      .select();

    if (error) {
      console.error('Error inserting stores:', error);
      return;
    }

    console.log(`${insertedStores.length} stores created`);
    return insertedStores;
  } catch (error) {
    console.error('Error in initializeStores:', error);
  }
};
