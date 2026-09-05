import mongoose, {Schema} from "mongoose";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"


const userSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true, 
            index: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true, 
        },
        fullName: {
            type: String,
            required: true,
            trim: true, 
            index: true
        },
        avatar: {
            type: String, // cloudinary url
            required: true,
        },
        coverImage: {
            type: String, // cloudinary url
        },
        watchHistory: [
            {
                type: Schema.Types.ObjectId,
                ref: "Video"
            }
        ],
        password: {
            type: String,
            required: [true, 'Password is required']
        },
        refreshToken: {
            type: String
        }

    },
    {
        timestamps: true
    }
)

// Hash the password before saving the user model
//pre is mongoose middleware which runs before saving document
userSchema.pre("save", async function () { 
    if(!this.isModified("password")) return ; // if password is not modified then skip hashing

    this.password = await bcrypt.hash(this.password, 10) //hash the password with salt rounds = 10
    // next();
})

// Method to compare given password with database hashed password
userSchema.methods.isPasswordCorrect = async function(password){ 
    return await bcrypt.compare(password, this.password) // true or false
} 

// Method to generate JWT tokens
userSchema.methods.generateAccessToken = function(){ 
    //sign parameters: payload, secret key, options
    return jwt.sign( // no arrow function here because we need 'this' keyword to refer to user document
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullName: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY 
        }
    )
}

// Method to generate Refresh Token
userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id: this._id, 
            //why we not put other details like email, username here? because refresh token is only used to get new access token. so just _id is enough
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User = mongoose.model("User", userSchema)