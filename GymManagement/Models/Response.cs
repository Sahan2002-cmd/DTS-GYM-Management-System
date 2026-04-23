using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace GymManagement.Models
{
    public class Response
    {
        public int StatusCode { get; set; } = 200;
        public object ResultList { get; set; }
        public string Message { get; set; }
        public string Result { get; set; } = "Success";
        public object Data { get; internal set; }
        public object ResultSet { get; set; }
    }
}