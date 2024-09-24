import {GoogleCallbackParameters, Profile, Strategy as GoogleStrategy, VerifyCallback} from 'passport-google-oauth20';
import {PassportStatic} from "passport";
import {Request} from "express";
import UserRepository from "../persistence/repositories/UserRepository.js";

type PassportProps = {clientID: string, clientSecret: string, callbackURL: string, scope: string};
type PassportDeps = {userRepository: UserRepository};

export default function (passport: PassportStatic, {clientID, clientSecret, callbackURL, scope}: PassportProps, {userRepository}: PassportDeps) {
    passport.serializeUser(function (user, done) {
        done(null, user.googleId);
    });

    passport.deserializeUser(async function (userId: string, done) {
        try {
            const userData = await userRepository.get(userId);
            if (!userData) {
                return done(null, null);
            }
            const {googleId, name, email} = userData;
            return done(null, {googleId, name, email});
        } catch (error) {
            done(error, null);
        }
    });

    passport.use(new GoogleStrategy({
            clientID,
            clientSecret,
            callbackURL,
            passReqToCallback: true,
        },
        async function (request: Request, accessToken: string, refreshToken: string, params: GoogleCallbackParameters, profile: Profile, done: VerifyCallback) {
            try {
                const userData = await userRepository.get(profile.id);
                if (userData) {
                    const {googleId, name, email} = userData;
                    return done(null, {googleId, name, email});
                } else {
                    const user = {
                        googleId: profile.id,
                        name: profile.displayName,
                        email: profile.emails ? profile.emails[0].value : '',
                    };
                    const token = {
                        access_token: accessToken,
                        refresh_token: refreshToken,
                        scope,
                        token_type: params.token_type,
                        expiry_date:params.expires_in
                    }
                    await userRepository.save({user, token});
                    return done(null, user);
                }
            } catch(error) {
                return done(error as Error);
            }
        }
    ));
}
