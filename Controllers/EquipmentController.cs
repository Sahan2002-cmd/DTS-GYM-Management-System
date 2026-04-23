using GymManagement.Interfaces;
using GymManagement.Models;
using System.Web.Mvc;

namespace GymManagement.Controllers
{
    public class EquipmentController : Controller
    {
        private readonly IEquipment _equipment;
        private readonly IUser _user;

        public EquipmentController(IEquipment equipment, IUser user)
        {
            _equipment = equipment;
            _user = user;
        }

        // GET /equipment/getall
        [HttpGet]
        public ActionResult GetAll()
            => Json(_equipment.GetAll(), JsonRequestBehavior.AllowGet);

        // GET /equipment/getbyid?id=1
        [HttpGet]
        public ActionResult GetById(int id)
            => Json(_equipment.GetById(id), JsonRequestBehavior.AllowGet);

        // POST /equipment/add
        [HttpPost]
        public ActionResult Add(EquipmentRequestModel req, int adminId = 0)
        {
            int eff = (req.p_admin_id.HasValue && req.p_admin_id.Value > 0) ? req.p_admin_id.Value : adminId;
            if (!_user.IsAdmin(eff))
                return Json(new { StatusCode = 403, Message = "Unauthorized" });
            req.p_admin_id = eff;
            return Json(_equipment.Add(req));
        }

        // POST /equipment/edit
        [HttpPost]
        public ActionResult Edit(EquipmentRequestModel req, int adminId = 0)
        {
            int eff = (req.p_admin_id.HasValue && req.p_admin_id.Value > 0) ? req.p_admin_id.Value : adminId;
            if (!_user.IsAdmin(eff))
                return Json(new { StatusCode = 403, Message = "Unauthorized" });
            req.p_admin_id = eff;
            return Json(_equipment.Edit(req));
        }

        // POST /equipment/delete?id=1&adminId=1
        [HttpPost]
        public ActionResult Delete(int id, int adminId = 0)
        {
            if (!_user.IsAdmin(adminId))
                return Json(new { StatusCode = 403, Message = "Unauthorized" });
            return Json(_equipment.Delete(id, adminId));
        }

        // POST /equipment/tag?equipmentId=1&rfidId=123
        [HttpPost]
        public ActionResult Tag(int equipmentId, int rfidId)
        {
            return Json(_equipment.Tag(equipmentId, rfidId));
        }
    }
}