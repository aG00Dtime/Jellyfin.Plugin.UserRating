using System;
using System.Linq;
using System.Net.Mime;
using System.Threading.Tasks;
using Jellyfin.Plugin.UserRatings.Data;
using Jellyfin.Plugin.UserRatings.Models;
using MediaBrowser.Common.Configuration;
using MediaBrowser.Controller.Library;
using MediaBrowser.Model.Services;
using Microsoft.AspNetCore.Mvc;

namespace Jellyfin.Plugin.UserRatings.Api
{
    [ApiController]
    [Route("api/UserRatings")]
    public class RatingsController : ControllerBase
    {
        private readonly RatingRepository _repository;
        private readonly IUserManager _userManager;
        private readonly ILibraryManager _libraryManager;
        private readonly IAuthorizationContext _authContext;

        public RatingsController(
            IApplicationPaths appPaths, 
            IUserManager userManager, 
            ILibraryManager libraryManager,
            IAuthorizationContext authContext)
        {
            _repository = new RatingRepository(appPaths);
            _userManager = userManager;
            _libraryManager = libraryManager;
            _authContext = authContext;
        }

        private async Task<Guid> GetUserIdAsync()
        {
            var auth = await _authContext.GetAuthorizationInfo(Request);
            if (auth.UserId == Guid.Empty)
            {
                throw new UnauthorizedAccessException("User ID not found");
            }
            return auth.UserId;
        }

        [HttpPost("Rate")]
        [Produces(MediaTypeNames.Application.Json)]
        public async Task<ActionResult> RateItem([FromQuery] Guid itemId, [FromQuery] int rating, [FromQuery] string? note)
        {
            try
            {
                if (rating < 1 || rating > 5)
                {
                    return BadRequest(new { success = false, message = "Rating must be between 1 and 5" });
                }

                var userId = await GetUserIdAsync();
                var user = _userManager.GetUserById(userId);

                var userRating = new UserRating
                {
                    ItemId = itemId,
                    UserId = userId,
                    Rating = rating,
                    Note = note,
                    Timestamp = DateTime.UtcNow,
                    UserName = user?.Username
                };

                _repository.SaveRating(userRating);

                return Ok(new { success = true, message = "Rating saved successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        [HttpGet("Item/{itemId}")]
        [Produces(MediaTypeNames.Application.Json)]
        public ActionResult GetItemRatings(Guid itemId)
        {
            try
            {
                var ratings = _repository.GetRatingsForItem(itemId);
                var stats = _repository.GetStatsForItem(itemId);

                return Ok(new
                {
                    success = true,
                    ratings = ratings.Select(r => new
                    {
                        userId = r.UserId,
                        userName = r.UserName,
                        rating = r.Rating,
                        note = r.Note,
                        timestamp = r.Timestamp
                    }),
                    averageRating = stats.AverageRating,
                    totalRatings = stats.TotalRatings
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        [HttpGet("User/{userId}")]
        [Produces(MediaTypeNames.Application.Json)]
        public ActionResult GetUserRatings(Guid userId)
        {
            try
            {
                var ratings = _repository.GetRatingsForUser(userId);

                return Ok(new
                {
                    success = true,
                    ratings = ratings.Select(r => new
                    {
                        itemId = r.ItemId,
                        rating = r.Rating,
                        note = r.Note,
                        timestamp = r.Timestamp
                    })
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        [HttpDelete("Rating")]
        [Produces(MediaTypeNames.Application.Json)]
        public async Task<ActionResult> DeleteRating([FromQuery] Guid itemId)
        {
            try
            {
                var userId = await GetUserIdAsync();
                _repository.DeleteRating(itemId, userId);

                return Ok(new { success = true, message = "Rating deleted successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        [HttpGet("MyRating/{itemId}")]
        [Produces(MediaTypeNames.Application.Json)]
        public async Task<ActionResult> GetMyRating(Guid itemId)
        {
            try
            {
                var userId = await GetUserIdAsync();
                var rating = _repository.GetRating(itemId, userId);

                if (rating == null)
                {
                    return Ok(new { success = true, rating = (int?)null });
                }

                return Ok(new
                {
                    success = true,
                    rating = rating.Rating,
                    note = rating.Note,
                    timestamp = rating.Timestamp
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }
    }
}

