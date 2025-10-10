// actions/get-user-data.ts
"use server";


export async function getUserData() {
  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  return profile;
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
