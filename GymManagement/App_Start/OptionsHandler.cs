using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace GymManagement.App_Start
{
    public class OptionsHandler : IHttpModule
    {
        public void Init(HttpApplication context)
        {
            context.BeginRequest += (sender, e) =>
            {
                var app = (HttpApplication)sender;
                if (app.Context.Request.HttpMethod == "OPTIONS")
                {
                    app.Context.Response.StatusCode = 200;
                    app.Context.Response.End();
                }
            };
        }
        public void Dispose() { }
    }
}