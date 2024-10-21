import  {asyncHandler} from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"

const generateAccesssAndRefreshTokens = async(userId)=>{
    try {
        const user= await User.findById(userId)
        const accessToken = user.generateAccesssToken(); // generateAccesssToken from user.model.js 
        const refreshToken= user.generateRefreshToken(); // generateRefreshToken from user.model.js

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false})

        return {
            accessToken ,
            refreshToken
        }

    } catch (error) {
        throw new ApiError(500, "Something went Wrong while generating refresh and access token")
    }
}

const registerUser = asyncHandler( async(req,res)=>{
    // get user detais from frontend
    //   validation - not empty
    //  check if user already exists: username, email
    //      check for images, check for avatar
    //    uplod them to cloudinary , avatar
    //  create user object = create entry in db
    // remove password and refresh token field from response
    //   check for user creation
    //  return res

    const {fullName, email, username, password}=req.body;
    console.log("email: ",email);

    // if(fullName ==="") {
    //     throw new ApiError(400, "fullName is required")
    // }

    if (
        [fullName, email, username, password].some((field)=>field?.trim() === "")
    ) {
        throw new ApiError(400 ,"All fields are required")
    }

    const existedUser = await User.findOne({
        $or: [{ username },{ email }]
    })

    if(existedUser) {
        res.status(409).send("User already register")
        throw new ApiError(409, "User with email or username already exists")
    }

    console.log(req.files.avatar[0].path)

    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath=req.files?.coverImage[0]?.path;
/*
    // let avatarLocalPath;
    // if(req.files && Array.isArray(req.files.avatar) && req.files.avatar.length>0){
    //     avatarLocalPath = req.files.avatar[0].path
    // }

    // let coverImageLocalPath;
    // if(req.files && Array.isArray(req.files.coverImage) &&req.files.coverImage.length >0) {
    //     coverImageLocalPath = req.files.coverImage[0].path
    // }

*/

    // if(!avatarLocalPath) {
    //     throw new ApiError(400, "Avatar file is required")
    // }

    // const avatar = await uploadOnCloudinary(avatarLocalPath)
    // const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    // console.log(req.body,"============")

    // if(!avatar) {
    //     throw new ApiError(400, "Avatar file is required")
    // }

    const user = await User.create({
        fullName,
        avatar:  avatarLocalPath,
        coverImage: coverImageLocalPath,
        email,
        password,
        username:username.toLowerCase()
    })
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!createdUser) {
        throw new ApiError (500 ,"Something went wrong while registering the user")
    }

    return res.status(201).json(new ApiResponse(200, createdUser,"User registered successfully"))
})

const loginUser = asyncHandler( async (req, res)=>{
    // req body -> data
    // username or email base login
    // find the user
    // check password
    // access and refresh token
    // send cookies

    const {email , username , password}= req.body;

    if(!username && !email) {
        throw new ApiError(400 ,"Username or Password is required")
    }

    const user = await User.findOne({
        $or: [{username},{email}]
    })
    if(!user) {
        throw new ApiError(404 ,"user does not exists")
    }

    const isPasswordValid = await user.isPasswordCorrect(password) // call function from user.model.js

    if(!isPasswordValid){
        throw new ApiError(401, "User Password not valid")
    }

    const {accessToken , refreshToken} = await generateAccesssAndRefreshTokens(user._id);

    const loggedInUser = await User.findById(user._id).select(" -password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }
    return res.status(200).cookie("accessToken" ,accessToken , options).cookie("refreshToken" , refreshToken , options).json(
        new ApiResponse(200 ,
            {
            user: loggedInUser , accessToken , refreshToken
        },"User logged In Successfully"
    )
    )
})

const logoutUser = asyncHandler(async(req, res)=>{
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }
    return res.status(200).clearCookie("accessToken", options).clearCookie("refreshToken", options).json(new ApiResponse(200, {}, "User logged Out"))
})

export { 
    registerUser,
    loginUser,
    logoutUser
}
