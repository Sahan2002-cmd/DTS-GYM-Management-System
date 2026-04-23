using System;
using System.Configuration;
using System.Data;
using System.Data.SqlClient;
using System.Reflection;

namespace GymManagement.Database_Layer
{
    public class DBconnect : IDisposable
    {
        private readonly SqlConnection _conn;

        public DBconnect()
        {
            string cs = ConfigurationManager
                        .ConnectionStrings["GymDB"]
                        .ConnectionString;

            _conn = new SqlConnection(cs);
            _conn.Open();
        }

        // ================= READ (SELECT) =================
        public ProcedureDBModel ProcedureRead<T>(T model, string procName) where T : class
        {
            var result = new ProcedureDBModel();

            try
            {
                using (var cmd = BuildCommand(procName, model))
                {
                    using (var adapter = new SqlDataAdapter(cmd))
                    {
                        DataTable dt = new DataTable();
                        adapter.Fill(dt);
                        result.ResultDataTable = dt;
                    }

                    // Output parameters
                    result.ResultStatusCode =
                        cmd.Parameters["@p_result_status_code"].Value?.ToString() ?? "1";

                    result.ExceptionMessage =
                        cmd.Parameters["@p_exception_message"].Value?.ToString();
                }
            }
            catch (Exception ex)
            {
                result.ResultStatusCode = "-1";
                result.ExceptionMessage = ex.Message;
            }

            return result;
        }

        // ================= EXECUTE (INSERT/UPDATE/DELETE) =================
        public ProcedureDBModel ProcedureExecute<T>(T model, string procName) where T : class
        {
            var result = new ProcedureDBModel();

            try
            {
                using (var cmd = BuildCommand(procName, model))
                {
                    cmd.ExecuteNonQuery();

                    result.ResultStatusCode =
                        cmd.Parameters["@p_result_status_code"].Value?.ToString() ?? "1";

                    result.ExceptionMessage =
                        cmd.Parameters["@p_exception_message"].Value?.ToString();
                }
            }
            catch (Exception ex)
            {
                result.ResultStatusCode = "-1";
                result.ExceptionMessage = ex.Message;
            }

            return result;
        }

        // ================= COMMON COMMAND BUILDER =================
        private SqlCommand BuildCommand<T>(string procName, T model) where T : class
        {
            var cmd = new SqlCommand(procName, _conn)
            {
                CommandType = CommandType.StoredProcedure,
                CommandTimeout = 60
            };

            // Map model → parameters
            foreach (PropertyInfo prop in typeof(T).GetProperties())
            {
                // Skip complex objects
                if (prop.PropertyType.IsClass && prop.PropertyType != typeof(string))
                    continue;

                string paramName = "@" + prop.Name; // IMPORTANT: match SP param names
                object value = prop.GetValue(model) ?? DBNull.Value;

                cmd.Parameters.AddWithValue(paramName, value);
            }

            // Standard OUTPUT params
            cmd.Parameters.Add("@p_result_status_code", SqlDbType.Int)
                .Direction = ParameterDirection.Output;

            cmd.Parameters.Add("@p_exception_message", SqlDbType.NVarChar, 500)
                .Direction = ParameterDirection.Output;

            return cmd;
        }

        public void Dispose()
        {
            if (_conn != null)
            {
                _conn.Close();
                _conn.Dispose();
            }
        }

        public int ExecuteRawSql(string sql, Action<SqlCommand> addParameters = null)
        {
            using (var cmd = new SqlCommand(sql, _conn))
            {
                cmd.CommandTimeout = 60;
                addParameters?.Invoke(cmd);
                return cmd.ExecuteNonQuery();
            }
        }
        public int ExecuteNonQuery(string sql, Action<SqlCommand> addParameters = null)
        {
            using (var cmd = new SqlCommand(sql, _conn))
            {
                cmd.CommandTimeout = 60;
                addParameters?.Invoke(cmd);
                return cmd.ExecuteNonQuery();
            }
        }

        public object ExecuteScalar(string sql, Action<SqlCommand> addParameters = null)
        {
            using (var cmd = new SqlCommand(sql, _conn))
            {
                cmd.CommandTimeout = 60;
                addParameters?.Invoke(cmd);
                return cmd.ExecuteScalar();
            }
        }
        public SqlConnection GetConnection()
        {
            return _conn;
        }
    }
}