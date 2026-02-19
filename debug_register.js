
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://kfonaxmbpwczsltdeyus.supabase.co'
const supabaseKey = 'sb_publishable_uGDcMuUsGQANqlrHTO-9cQ_qTsOPTM4'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testRegister() {
    console.log('Attempting simulated registration...')

    const email = `test.user.${Date.now()}@example.com`
    const password = 'TestPassword123!'
    const name = 'Debug User'

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: name
            }
        }
    })

    if (error) {
        console.error('❌ Registration Failed:', error.message)
        console.error('Full Error:', JSON.stringify(error, null, 2))
    } else {
        console.log('✅ Registration Successful!')
        console.log('User ID:', data.user?.id)

        // Verify profile creation
        const { data: profile, error: profError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single()

        if (profError) {
            console.error('❌ Profile Creation Failed (Trigger Check):', profError.message)
        } else {
            console.log('✅ Profile Created:', profile)
        }
    }
}

testRegister()
