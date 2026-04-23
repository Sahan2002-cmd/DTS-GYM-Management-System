using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using GymManagement.Models;

namespace GymManagement.Interfaces
{
    public interface IPlan
    {
        Response GetAll();
        Response GetById(int planId);
        Response Add(PlanRequestModel req);
        Response Edit(PlanRequestModel req);
        Response Delete(int planId, int adminId);
    }
}