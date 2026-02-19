
const supabaseUrl = 'https://kfonaxmbpwczsltdeyus.supabase.co'
const supabaseKey = 'sb_publishable_uGDcMuUsGQANqlrHTO-9cQ_qTsOPTM4'

console.log('Testing connection to:', supabaseUrl)

async function test() {
    try {
        const response = await fetch(`${supabaseUrl}/rest/v1/profiles?select=count`, {
            headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`
            }
        })

        console.log('Status:', response.status)
        const text = await response.text()
        console.log('Body:', text)
    } catch (err) {
        console.error('Fetch Failed:', err.message)
    }
}

test()
