
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://kfonaxmbpwczsltdeyus.supabase.co'
const supabaseKey = 'sb_publishable_uGDcMuUsGQANqlrHTO-9cQ_qTsOPTM4' // from .env (might be truncated but let's try)
// wait, that key looks suspiciously short or weird. Usually anon keys are much longer JWTs.
// But maybe it's correct. Let's try.

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkSubs() {
    const { data, error } = await supabase
        .from('subscriptions')
        .select('*')

    if (error) {
        console.error('Error:', error)
        return
    }

    console.log('Total Subscriptions:', data.length)

    // Group by user_id
    const userSubs = {}
    data.forEach(sub => {
        if (!userSubs[sub.user_id]) userSubs[sub.user_id] = []
        userSubs[sub.user_id].push(sub)
    })

    Object.keys(userSubs).forEach(userId => {
        if (userSubs[userId].length > 1) {
            console.log(`User ${userId} has ${userSubs[userId].length} subscriptions:`)
            console.log(JSON.stringify(userSubs[userId], null, 2))
        }
    })
}

checkSubs()
