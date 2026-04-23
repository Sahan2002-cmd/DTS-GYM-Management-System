using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace GymManagement.Controllers
{
    public class HomeController : Controller
    {

        [HttpGet]
        public ActionResult Index()
        {
            return Json(new
            {
                StatusCode = 200,
                Message = "DTS GYM API is running.",
                Version = "1.0"
            }, JsonRequestBehavior.AllowGet);
        }
    }
}