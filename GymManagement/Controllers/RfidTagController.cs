// ============================================================
//  File : Controllers/RfidTagController.cs  (UPDATED)
//  Changes: Added ToggleStatus action for active/inactive
// ============================================================
using GymManagement.Interfaces;
using GymManagement.Models;
using System.Web.Mvc;

namespace GymManagement.Controllers
{
    public class RfidTagController : Controller
    {
        private readonly IRfidTag _rfidTag;
        private readonly IUser _user;

        public RfidTagController(IRfidTag rfidTag, IUser user)
        {
            _rfidTag = rfidTag;
            _user = user;
        }

        // GET /rfidtag/getall
        [HttpGet]
        public ActionResult GetAll()
            => Json(_rfidTag.GetAll(), JsonRequestBehavior.AllowGet);

        // GET /rfidtag/getbyid?id=1
        [HttpGet]
        public ActionResult GetById(int id)
            => Json(_rfidTag.GetById(id), JsonRequestBehavior.AllowGet);

        // GET /rfidtag/getbymember?memberId=3
        [HttpGet]
        public ActionResult GetByMember(int memberId)
            => Json(_rfidTag.GetByMember(memberId), JsonRequestBehavior.AllowGet);

        // POST /rfidtag/add
        [HttpPost]
        public ActionResult Add(RfidTagRequestModel req, int adminId)
        {
            if (!_user.IsAdmin(adminId))
                return Json(new { StatusCode = 403, Message = "Unauthorized." });
            return Json(_rfidTag.Add(req));
        }

        // POST /rfidtag/edit
        [HttpPost]
        public ActionResult Edit(RfidTagRequestModel req, int adminId)
        {
            if (!_user.IsAdmin(adminId))
                return Json(new { StatusCode = 403, Message = "Unauthorized." });
            return Json(_rfidTag.Edit(req));
        }

        // POST /rfidtag/togglestatus
        // Body: { "rfidId": 1, "adminId": 1 }
        // Toggles is_status between 'active' and 'inactive'
        [HttpPost]
        public ActionResult ToggleStatus(int rfidId, int adminId)
        {
            if (!_user.IsAdmin(adminId))
                return Json(new { StatusCode = 403, Message = "Unauthorized." });
            return Json(_rfidTag.ToggleStatus(rfidId, adminId));
        }

        // POST /rfidtag/delete?id=1&adminId=1
        [HttpPost]
        public ActionResult Delete(int id, int adminId)
        {
            if (!_user.IsAdmin(adminId))
                return Json(new { StatusCode = 403, Message = "Unauthorized." });
            return Json(_rfidTag.Delete(id, adminId));
        }
    }
}
