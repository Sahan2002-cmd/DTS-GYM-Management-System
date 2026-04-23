using GymManagement.Interfaces;
using GymManagement.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace GymManagement.Controllers
{
    public class SubscriptionController : Controller
    {
        private readonly ISubscription _sub;
        private readonly IUser _user;

        public SubscriptionController(ISubscription sub, IUser user)
        {
            _sub = sub;
            _user = user;
        }

        [HttpGet]
        public ActionResult GetAll()
            => Json(_sub.GetAll(), JsonRequestBehavior.AllowGet);

        [HttpGet]
        public ActionResult GetActive()
            => Json(_sub.GetActiveSubscriptions(), JsonRequestBehavior.AllowGet);

        [HttpGet]
        public ActionResult GetById(int id)
            => Json(_sub.GetById(id), JsonRequestBehavior.AllowGet);

        [HttpGet]
        public ActionResult GetByMember(int memberId)
            => Json(_sub.GetByMember(memberId), JsonRequestBehavior.AllowGet);

        [HttpPost]
        public ActionResult Add(SubscriptionRequestModel req, int adminId)
        {
            if (!_user.IsAdmin(adminId))
                return Json(new { StatusCode = 403, Message = "Unauthorized" });
            return Json(_sub.Add(req));
        }

        [HttpPost]
        public ActionResult Edit(SubscriptionRequestModel req, int adminId)
        {
            if (!_user.IsAdmin(adminId))
                return Json(new { StatusCode = 403, Message = "Unauthorized" });
            return Json(_sub.Edit(req));
        }

        [HttpPost]
        public ActionResult Deactivate(int id, int adminId)
        {
            if (!_user.IsAdmin(adminId))
                return Json(new { StatusCode = 403, Message = "Unauthorized" });
            return Json(_sub.Deactivate(id, adminId));
        }

        // ADD this action:
        [HttpPost]
        public ActionResult Activate(int id, int adminId)
        {
            if (!_user.IsAdmin(adminId))
                return Json(new { StatusCode = 403, Message = "Unauthorized" });
            return Json(_sub.Activate(id, adminId));
        }
    }
}