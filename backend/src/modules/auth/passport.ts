import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { prisma } from "@database/prisma";

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            callbackURL: process.env.GOOGLE_CALLBACK_URL!,
        },
        async (_accessToken, _refreshToken, profile, done) => {
            try {
                const existingUser = await prisma.user.findUnique({
                    where: {
                        googleId: profile.id,
                    },
                });
                if (existingUser) {
                    return done(null, existingUser);
                }
                const newUser = await prisma.user.create({
                    data: {
                        googleId: profile.id,

                        email: profile.emails?.[0].value || "",

                        username: profile.displayName,

                        avatar: profile.photos?.[0].value,
                    },
                });

                return done(null, newUser);
            } catch (error) {
                return done(error);
            }
        },
    ),
);

export default passport;
