using GymManagement.DataAccess;
using GymManagement.Interfaces;
using GymManagement.Models;
using System.Web.Mvc;

namespace GymManagement.Controllers
{
    public class ComplaintController : Controller
    {
        private readonly IComplaint _complain;
        private readonly IUser _user;

        public ComplaintController(IComplaint complain, IUser user)
        {
            _complain = complain;
            _user = user;
        }

        [HttpGet]
        public ActionResult GetAll() => Json(_complain.GetAll(), JsonRequestBehavior.AllowGet);

        [HttpGet]
        public ActionResult GetById(int id) => Json(_complain.GetById(id), JsonRequestBehavior.AllowGet);

        [HttpGet]
        public ActionResult GetByUser(int userId) => Json(_complain.GetByUser(userId), JsonRequestBehavior.AllowGet);

        [HttpPost]
        public ActionResult Add(ComplaintRequestModel req)
        {
            // Optionally check that user exists
            return Json(_complain.AddComplaint(req));
        }

        [HttpPost]
        public ActionResult UpdateStatus(int complaintId, string status, int adminId)
        {
            if (!_user.IsAdmin(adminId))
                return Json(new { StatusCode = 403, Message = "Unauthorized." });
            return Json(_complain.UpdateStatus(complaintId, status, adminId));
        }

        [HttpPost]
        public ActionResult AddRating(int complaintId, int rating)
        {
            if (rating < 1 || rating > 5)
                return Json(new { StatusCode = 400, Message = "Rating must be 1-5." });
            return Json(_complain.AddRating(complaintId, rating));
        }
    }
}