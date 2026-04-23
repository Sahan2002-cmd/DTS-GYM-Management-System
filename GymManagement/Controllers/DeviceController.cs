using GymManagement.DataAccess;
using GymManagement.Interfaces;
using GymManagement.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace GymManagement.Controllers
{
    public class DeviceController : Controller
    {
        private readonly IDevice _device;

        public DeviceController(IDevice device)
        {
            _device = device;
        }
        // GET /device/getall
        [HttpGet]
        public ActionResult GetAll()
        {
            var result = _device.GetAllDevice();
            return Json(result, JsonRequestBehavior.AllowGet);
        }

        // POST /device/add
        [HttpPost]
        public ActionResult Add(DeviceRequestModel req, int adminId = 0)
        {
            int effectiveAdmin = (req.p_admin_id.HasValue && req.p_admin_id.Value > 0) ? req.p_admin_id.Value : adminId;
            req.p_admin_id = effectiveAdmin;
            req.p_action_type = "003";
            return Json(_device.AddDevice(req));
        }

        // POST /device/edit
        [HttpPost]
        public ActionResult Edit(DeviceRequestModel req, int adminId = 0)
        {
            int effectiveAdmin = (req.p_admin_id.HasValue && req.p_admin_id.Value > 0) ? req.p_admin_id.Value : adminId;
            req.p_admin_id = effectiveAdmin;
            req.p_action_type = "004";
            return Json(_device.EditDevice(req));
        }

        // POST /device/delete
        [HttpPost]
        public ActionResult Delete(int id, int adminId = 0)
        {
            return Json(_device.DeleteDevice(id, adminId));
        }

    }
}