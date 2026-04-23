using GymManagement.Interfaces;
using GymManagement.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace GymManagement.Controllers
{
    public class EquipmentUsageLogController : Controller
    {
        private readonly IEquipmentUsageLog _log;

        public EquipmentUsageLogController(IEquipmentUsageLog log)
        {
            _log = log;
        }

        // GET /equipmentusagelog/getall
        [HttpGet]
        public ActionResult GetAll()
            => Json(_log.GetAll(), JsonRequestBehavior.AllowGet);

        // GET /equipmentusagelog/getbyid?id=1
        [HttpGet]
        public ActionResult GetById(int id)
            => Json(_log.GetById(id), JsonRequestBehavior.AllowGet);

        // GET /equipmentusagelog/getbymember?memberId=3
        [HttpGet]
        public ActionResult GetByMember(int memberId)
            => Json(_log.GetByMember(memberId), JsonRequestBehavior.AllowGet);

        // GET /equipmentusagelog/getbydevice?deviceId=2
        [HttpGet]
        public ActionResult GetByDevice(int deviceId)
            => Json(_log.GetByDevice(deviceId), JsonRequestBehavior.AllowGet);

        // GET /equipmentusagelog/activelogs
        // Admin/Trainer can see who is currently using which equipment RIGHT NOW
        [HttpGet]
        public ActionResult ActiveLogs()
            => Json(_log.GetActiveLogs(), JsonRequestBehavior.AllowGet);

        // POST /equipmentusagelog/start
        // Called when member scans RFID on an equipment machine scanner
        [HttpPost]
        public ActionResult Start(EquipmentUsageLogRequestModel req)
        {
            return Json(_log.StartUsage(req));
        }

        // POST /equipmentusagelog/end
        // Called when member scans RFID to stop using equipment
        [HttpPost]
        public ActionResult End(int logId, string endtime, int actualMins)
        {
            return Json(_log.EndUsage(logId, endtime, actualMins));
        }
    }
}