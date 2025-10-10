import { supabaseServerClient } from "@/supabase/supabaseServer";

export async function getUserData() {
'use server';

import { createServerActionClient } from '@/lib/supabase-server-actions';

export const createWorkspace = async (/* ... */) => {
  const supabase = await createServerActionClient();
  
  // All your logic here with the same client instance
  const { data: { user } } = await supabase.auth.getUser();
  // ... rest of your code
};

export const getUserData = async () => {
  const supabase = await createServerActionClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  return data;
};
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) return null;

  const { data } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  return data;
}


// export const getUserDataPages = async (
//   req: NextApiRequest,
//   res: NextApiResponse
// ): Promise<User | null> => {
//   const supabase = supabaseServerClientPages(req, res);

//   const {
//     data: { user },
//   } = await supabase.auth.getUser();

//   if (!user) {
//     console.log('NO USER', user);
//     return null;
//   }

//   const { data, error } = await supabase
//     .from('users')
//     .select('*')
//     .eq('id', user.id);

//   if (error) {
//     console.log(error);
//     return null;
//   }

//   return data ? data[0] : null;
// };
