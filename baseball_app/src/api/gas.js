const BASE_URL = "https://script.google.com/macros/s/XXXXXXXX/exec"

export async function getEvents() {
  const res = await fetch(`${BASE_URL}?type=events`)
  return await res.json()
}

export async function registerRecord(data) {
  const res = await fetch(BASE_URL, {
    method: "POST",
    body: JSON.stringify(data),
  })
  return await res.json()
}
