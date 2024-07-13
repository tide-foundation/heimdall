using Microsoft.AspNetCore.Mvc;
using SecretAlbum.Services;
using H4x2_TinySDK.Ed25519;
using H4x2_TinySDK.Math;
using SecretAlbum.Models;

namespace SecretAlbum.Controllers
{
    public class UserController : Controller
    {
        private readonly ILogger<UserController> _logger;
        private IUserService _userService;

        public UserController(ILogger<UserController> logger, IUserService userService)
        {
            _logger = logger;
            _userService = userService;
        }

        [HttpGet]
        public IActionResult GetTime()
        {
            return Ok(DateTime.Now.ToString());
        }

        [HttpGet]
        public IActionResult GetAlbums()
        {
            try
            {
                return Ok(_userService.GetAlbums());
            }
            catch
            {
                return Ok("--FAILED--");
            }
        }

        [HttpPost]
        public async Task<IActionResult> RegisterAlbum([FromQuery] string albumId, [FromForm] string jwt, [FromForm] string userAlias, [FromForm] string publicKey)
        {
            if (!userAlias.All(char.IsLetterOrDigit))
            {
                return Ok("Failed: Only alphanumeric characters are allowed in the user alias.");
            }
            if (userAlias.Length > 20)
            {
                return Ok("Failed: User alias exceeded the limit of 20 characters.");
            }
            try
            {
                var tideJWT = new TideJWT(jwt, true);
                if (!tideJWT.VerifySignature(Point.FromBase64(publicKey)))
                {
                    return Ok("Failed: Token expired or wrong verification key.");
                }

                string response = _userService.RegisterAlbum(albumId, userAlias, publicKey);   // save pubkey in database
                return Ok(response);
            }
            catch
            {
                return Ok("--FAILED--");
            }
        }

        [HttpGet]
        public IActionResult GetImages([FromQuery] string uid)
        {
            try
            {
                return Ok(_userService.GetUserImages(uid));
            }
            catch
            {
                return Ok("--FAILED--");
            }
        }

        [HttpPost]
        public IActionResult AddImage([FromQuery] string albumId, [FromForm] string jwt, [FromForm] string seed, [FromForm] string encryptedImg, [FromForm] string description, [FromForm] string pubKey)
        {
            if (description.Length > 300)
            {
                return Ok("Failed: Description exceeded the limit of 300 characters.");
            }
            try
            {
                var tideJwt = new TideJWT(jwt, true);

                Point verifyKey = _userService.GetVerifyKey(albumId);

                if (!tideJwt.VerifySignature(verifyKey))
                {
                    return Ok("Failed: Token expired or wrong verification key.");
                }
                string response = _userService.AddImage(albumId, seed, encryptedImg, description, "0");
                return Ok(response);
            }
            catch
            {
                return Ok("--FAILED--");
            }

        }

        [HttpPost]
        public IActionResult DeleteImage([FromQuery] string albumId, [FromForm] string imageId, [FromForm] string jwt)
        {
            try
            {
                var tideJwt = new TideJWT(jwt, true);

                Point verifyKey = _userService.GetVerifyKey(albumId);

                if (!tideJwt.VerifySignature(verifyKey))
                {
                    return Ok("Failed: Token expired or wrong verification key.");
                }

                string response = _userService.DeleteImage(imageId);
                return Ok(response);
            }
            catch
            {
                return Ok("--FAILED--");
            }

        }

        [HttpPost]
        public IActionResult MakePublic([FromQuery] string albumId, [FromForm] string jwt, [FromForm] string imageId, [FromForm] string pubKey)
        {
            try
            {
                var tideJwt = new TideJWT(jwt, true);

                Point verifyKey = _userService.GetVerifyKey(albumId);

                if (!tideJwt.VerifySignature(verifyKey))
                {
                    return Ok("Failed: Token expired or wrong verification key.");
                }

                string response = _userService.MakePublic(albumId, imageId, pubKey);
                return Ok(response);
            }
            catch
            {
                return Ok("--FAILED--");
            }

        }
    }
}