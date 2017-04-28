defmodule Wwm.Web.PageControllerTest do
  use Wwm.Web.ConnCase

  test "GET /", %{conn: conn} do
    conn = get conn, "/"
    assert html_response(conn, 200) =~ "Server Test Client"
  end
end
