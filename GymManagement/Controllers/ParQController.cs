using GymManagement.Interfaces;
using GymManagement.Models;
using System.Web.Mvc;

namespace GymManagement.Controllers
{
    public class ParQController : Controller
    {
        private readonly IParQ _parq;
        private readonly IUser _user;

        public ParQController(IParQ parq, IUser user)
        {
            _parq = parq;
            _user = user;
        }

        // ── GET /ParQ/GetAll  (Admin only) ──────────────────────
        [HttpGet]
        public ActionResult GetAll()
        {
            return Json(_parq.GetAll(), JsonRequestBehavior.AllowGet);
        }

        // ── GET /ParQ/GetByUserId?userId=5  (own record / trainer) ──
        [HttpGet]
        public ActionResult GetByUserId(int userId)
        {
            return Json(_parq.GetByUserId(userId), JsonRequestBehavior.AllowGet);
        }

        // ── GET /ParQ/GetByTrainerId?trainerId=3  (trainer sees assigned members) ──
        [HttpGet]
        public ActionResult GetByTrainerId(int trainerId)
        {
            return Json(_parq.GetByTrainerId(trainerId), JsonRequestBehavior.AllowGet);
        }

        // ── POST /ParQ/Save  (member submits or updates PAR-Q) ──
        // Accepts form-encoded fields: p_user_id, p_q1..p_q7, p_q7_details,
        //                              p_physician_clearance
        [HttpPost]
        public ActionResult Save(ParQRequestModel req)
        {
            if (req.p_user_id == null)
                return Json(new { StatusCode = 400, Result = "p_user_id is required." });

            return Json(_parq.Save(req), JsonRequestBehavior.AllowGet);
        }
    }
}