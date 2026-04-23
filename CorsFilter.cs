using System.Web.Mvc;

public class AllowCorsAttribute : ActionFilterAttribute
{
    public override void OnActionExecuting(ActionExecutingContext filterContext)
    {
        var response = filterContext.RequestContext.HttpContext.Response;
        response.Headers.Add("Access-Control-Allow-Origin", "http://localhost:5173"); // Your Vite frontend URL
        response.Headers.Add("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        response.Headers.Add("Access-Control-Allow-Headers", "Content-Type, Accept, Authorization, X-Requested-With");
        response.Headers.Add("Access-Control-Allow-Credentials", "true");

        if (filterContext.HttpContext.Request.HttpMethod == "OPTIONS")
        {
            filterContext.Result = new HttpStatusCodeResult(200);
            return;
        }
        base.OnActionExecuting(filterContext);
    }
}