export async function listAllEmployees(fetchPage, params = {}) {
  const employees = [];
  let page = 1;
  let pages = 1;

  do {
    const { data } = await fetchPage({ ...params, page, limit: 100 });
    const result = data.data;
    employees.push(...(result.employees || []));
    pages = result.pagination?.pages || 1;
    page += 1;
  } while (page <= pages);

  return employees;
}
