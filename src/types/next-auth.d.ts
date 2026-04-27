import "next-auth";

declare module "next-auth" {
  interface User {
    role?: string;
    id?: string;
  }

  interface Session {
    user: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: string;
      id?: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string;
    uid?: string;
  }
}
