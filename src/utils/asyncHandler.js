const asyncHandler = (reqHandler) => {
    return (req, res, next) => {
        Promise.resolve(reqHandler(req, res, next)).catch((err) => { next(err) })
    }
}



// const asyncHandler = (reqHandler) => {
//     async (req, res, next) => {
//         try {
//             reqHandler(req, res, next)
//         } catch (error) {
//             console.log("Error is :", error)
//             res.status(err.code || 500).json({
//                 success: false,
//                 message: err.message
//             })
//         }
//     }

// }
export { asyncHandler }