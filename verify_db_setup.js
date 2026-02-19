
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://kfonaxmbpwczsltdeyus.supabase.co'
const supabaseKey = 'sb_publishable_uGDcMuUsGQANqlrHTO-9cQ_qTsOPTM4'

const supabase = createClient(supabaseUrl, supabaseKey)

async function verify() {
    console.log('Verifying Database Setup...')

    // Check Profiles Table
    const { error: profilesError } = await supabase.from('profiles').select('id').limit(1)
    if (profilesError) console.error('❌ Profiles Table Error:', profilesError.message)
    else console.log('✅ Profiles Table: exists')

    // Check User Status Table
    const { error: statusError } = await supabase.from('user_status').select('user_id').limit(1)
    if (statusError) console.error('❌ User Status Table Error:', statusError.message)
    else console.log('✅ User Status Table: exists')

    // Check Plans Table & Free Plan
    const { data: plans, error: plansError } = await supabase.from('plans').select('*')
    if (plansError) {
        console.error('❌ Plans Table Error:', plansError.message)
    } else {
        console.log('✅ Plans Table: exists')
        const freePlan = plans.find(p => p.name === 'Free')
        if (!freePlan) console.error('❌ Missing "Free" Plan! (Trigger will fail)')
        else console.log('✅ "Free" Plan: exists')
    }

    // Check Subscriptions Table
    const { error: subsError } = await supabase.from('subscriptions').select('id').limit(1)
    if (subsError) console.error('❌ Subscriptions Table Error:', subsError.message)
    else console.log('✅ Subscriptions Table: exists')

}

verify()
