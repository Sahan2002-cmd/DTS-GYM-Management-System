using GymManagement.Interfaces;
using GymManagement.Models;
using System.Web.Mvc;

namespace GymManagement.Controllers
{
    public class PlanController : Controller
    {
        private readonly IPlan _plan;
        private readonly IUser _user;

        public PlanController(IPlan plan, IUser user)
        {
            _plan = plan;
            _user = user;
        }

        // GET /plan/getall  — everyone can view plans
        [HttpGet]
        public ActionResult GetAll()
            => Json(_plan.GetAll(), JsonRequestBehavior.AllowGet);

        // GET /plan/getbyid?id=1
        [HttpGet]
        public ActionResult GetById(int id)
            => Json(_plan.GetById(id), JsonRequestBehavior.AllowGet);

        // POST /plan/add  — Admin only
        [HttpPost]
        public ActionResult Add(PlanRequestModel req, int adminId)
        {
            if (!_user.IsAdmin(adminId))
                return Json(new { StatusCode = 403, Message = "Unauthorized" });
            return Json(_plan.Add(req));
        }

        // POST /plan/edit  — Admin only
        [HttpPost]
        public ActionResult Edit(PlanRequestModel req, int adminId)
        {
            if (!_user.IsAdmin(adminId))
                return Json(new { StatusCode = 403, Message = "Unauthorized" });
            return Json(_plan.Edit(req));
        }

        // POST /plan/delete?id=1&adminId=1  — Admin only
        [HttpPost]
        public ActionResult Delete(int id, int adminId)
        {
            if (!_user.IsAdmin(adminId))
                return Json(new { StatusCode = 403, Message = "Unauthorized" });
            return Json(_plan.Delete(id, adminId));
        }
    }
}