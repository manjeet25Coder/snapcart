import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import connectDb from "./lib/db"
import User from "./app/models/user.model"
import bcrypt from "bcryptjs"
import Google from "next-auth/providers/google"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        try {
          await connectDb()

          const { email, password } = credentials as {
            email: string
            password: string
          }

          if (!email || !password) {
            throw new Error("Missing credentials")
          }

          const user = await User.findOne({ email })

          if (!user) {
            throw new Error("User does not exist")
          }

          const isMatch = await bcrypt.compare(password, user.password)

          if (!isMatch) {
            throw new Error("Incorrect password")
          }

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
            image: user.image
          }

        } catch (error) {
          console.error("Auth error:", error)
          return null
        }
      },
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET
    })
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider == "google") {
        await connectDb()
        
        // Google profile typically has 'picture', while NextAuth maps it to 'image'
        // We use both as fallback to ensure we capture it
        const userImage = user.image || (profile as any)?.picture;
        
        console.log("Google Sign-In Attempt:", {
          email: user.email,
          imageFromUser: user.image,
          imageFromProfile: (profile as any)?.picture
        });

        let dbUser = await User.findOne({ email: user.email })
        
        if (!dbUser) {
          console.log("Creating new Google user:", user.email);
          dbUser = await User.create({
            name: user.name,
            email: user.email,
            image: userImage,
            role: "user" // Default role
          })
        } else {
          // If user exists but doesn't have an image, or if we want to sync the latest image
          if (!dbUser.image && userImage) {
            console.log("Updating missing image for existing user:", user.email);
            dbUser.image = userImage;
            await dbUser.save();
          }
        }
        
        // Update the user object for subsequent callbacks
        user.id = dbUser._id.toString()
        user.role = dbUser.role
        user.image = dbUser.image
      }
      return true
    },
    jwt({ token, user,trigger,session}) {
      if (user) {
        token.id = user.id
        token.name = user.name
        token.email = user.email
        token.role = user.role
        token.image = user.image
      } 
      if(trigger=="update"){
        token.role=session.role
      }
      console.log(token)

      return token
    },

    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.name = token.name as string
        session.user.email = token.email as string
        session.user.role = token.role as string
        session.user.image = token.image as string | undefined

      }
      return session
    }
  },
  pages: {
    signIn: "/login",
    error: "/login"
  },
  session: {
    strategy: "jwt",
    maxAge: 10 * 24 * 60 * 60 * 1000
  },
  secret: process.env.AUTH_SECRET
})
