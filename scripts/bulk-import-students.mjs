// One-off bulk import for the initial batch of real Clyra students.
// Usage: node --env-file=.env.local scripts/bulk-import-students.mjs
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const admin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// due dates for the three-installment plan every row uses
const DUE_DATES = ["2026-08-01", "2026-09-01", "2026-10-01"];

const students = [
  { name: "Jaikumar", college: "Dhanlakshmi", dept: "Artificial Intelligence and Data Science", phone: "8778977855", email: "jaikumarjanani1985@gmail.com", fee: 699, password: "#Jaikumar#" },
  { name: "Prasanna M", college: "Gnanamani College of Technology", dept: "CSE", phone: "7540020433", email: "muthusamy68173@gmail.com", fee: 500, password: "#PrasannaM#" },
  { name: "Mithunkumar S", college: "Gnanamani College of Technology", dept: "Computer Science and Engineering", phone: "8610774462", email: "mithunkumarsakthivel@gmail.com", fee: 500, password: "#MithunkumarS#" },
  { name: "Karthika M", college: "Gnanamani College of Technology", dept: "CSE", phone: "8438816701", email: "karthikamunusamy2007@gmail.com", fee: 500, password: "#KarthikaM#" },
  { name: "Sanga Elakkiya S", college: "Gnanamani College of Technology", dept: "CSE", phone: "8667050070", email: "sangaelakkiya2488@gmail.com", fee: 500, password: "#SangaElakkiyaS#" },
  { name: "Rokesh Waran", college: "Gnanamani College of Technology", dept: "CSE", phone: "7845106424", email: "vvrokeshwaran@gmail.com", fee: 500, password: "#RokeshWaran#" },
  { name: "Priyan B", college: "Gnanamani College of Technology", dept: "CSE", phone: "7010977653", email: "chanupriyan279@gmail.com", fee: 500, password: "#PriyanB#" },
  { name: "G S Rishi Pradeep", college: "Gnanamani College of Technology", dept: "Computer Science and Engineering", phone: "9080403419", email: "rishipradeep8865@gmail.com", fee: 500, password: "#GSRishiPradeep#" },
  { name: "Karthika R", college: "Gnanamani College of Technology", dept: "Computer Science and Engineering", phone: "9080458790", email: "karthikaraja112008@gmail.com", fee: 500, password: "#KarthikaR#" },
  { name: "Sathya Prakash", college: "Gnanamani College of Technology", dept: "CSE", phone: "9655998690", email: "prakash695599@gmail.com", fee: 500, password: "#SathyaPrakash#" },
  { name: "Kaviya C", college: "Gnanamani College of Technology", dept: "IT", phone: "9159749050", email: "kaviya@281111.com", fee: 500, password: "#KaviyaC#" },
  { name: "Pradeepa G", college: "Gnanamani College of Technology", dept: "CSE", phone: "8248177876", email: "pradeepagovindarajan8@gmail.com", fee: 500, password: "#PradeepaG#" },
  { name: "Rajadurai U", college: "Gnanamani College of Technology", dept: "Artificial Intelligence and Data Science", phone: "8667602377", email: "rajaduraiugi2008@gmail.com", fee: 500, password: "#RajaduraiU#" },
  { name: "Ramprasanth R", college: "Gnanamani College of Technology", dept: "Computer Science and Engineering", phone: "9363711280", email: "ramprasanth.ept@gmail.com", fee: 500, password: "#RamprasanthR#" },
  { name: "Santhi H", college: "Gnanamani College of Technology", dept: "CSE", phone: "9080934129", email: "santhihari2008@gmail.com", fee: 500, password: "#SanthiH#" },
  { name: "Dharaneesh K", college: "Knowledge Institute of Technology", dept: "Electronics and Communication Engineering", phone: "6381664554", email: "Dharaneeshkumar17@gmail.com", fee: 699, password: "#DharaneeshK#" },
  { name: "Krishnika", college: "S.K.P. Engineering College", dept: "Artificial Intelligence and Data Science", phone: "9087946900", email: "krishnikaprathapkumar@gmail.com", fee: 699, password: "#Krishnika#" },
  { name: "Visva Sivaani T K", college: "S.T. Hindu College", dept: "Bachelor of Computer Science", phone: "8220312320", email: "sivaanitk@gmail.com", fee: 699, password: "#VisvaSivaaniTK#" },
  { name: "Sakthi Rohith R M", college: "S.T. Hindu College", dept: "Bachelor of Computer Application", phone: "7200886233", email: "sakthirohithramesh2007@gmail.com", fee: 699, password: "#SakthiRohithRM#" },
  { name: "Yamini", college: "SKP Engineering College", dept: "Artificial Intelligence and Data Science", phone: "7845593506", email: "Yaminikumar572@gmail.com", fee: 599, password: "#Yamini#" },
  { name: "Dhivya Priya", college: "SKP Engineering College", dept: "B.Tech (Artificial Intelligence and Data Science)", phone: "8838557892", email: "ddhivyapriyaloganathan@gmail.com", fee: 699, password: "#DhivyaPriya#" },
  { name: "R. Swetha", college: "SKP Engineering College", dept: "B.Tech (AI&DS)", phone: "9384987197", email: "swethaswetha6819@gmail.com", fee: 699, password: "#RSwetha#" },
  { name: "Kavin Nilavan M P", college: "University College of Engineering, Nagercoil", dept: "Computer Science Engineering", phone: "9025087352", email: "Kavinnilavan9@gmail.com", fee: 699, password: "#KavinNilavanMP#" },
  { name: "Shrigothay", college: "Vellore Institute of Technology, Vellore", dept: "Computational Statistics and Data Analytics", phone: "7418622727", email: "gothay2703@gmail.com", fee: 500, password: "#Shrigothay#" },
  { name: "S. Bala Priya", college: "VSB Engineering College, Karur", dept: "BE CSE (AIML)", phone: "6382297635", email: "jeyalakshmi97635@gmail.com", fee: 699, password: "#SBalaPriya#" },
  { name: "Inthira S", college: "VSBCETC", dept: "2nd Year IT", phone: "9344713554", email: "inthiravisa8@gmail.com", fee: 699, password: "#InthiraS#" },
  { name: "Krisnabala", college: "Sastra Deemed University", dept: "CSE", phone: "9360780363", email: "krisnabalamurugan@gmail.com", fee: 500, password: "#Krisnabala#" },
  { name: "Sanjana", college: "Gnanamani College of Technology", dept: "CSE", phone: "9025775425", email: "sanjana2024m0310@gmail.com", fee: 500, password: "#Sanjana#" },
  { name: "Ragavi R", college: "SKP Engineering College", dept: "Electronics and Communication Engineering", phone: "8838197145", email: "ragavi0005ragavi005@gmail.com", fee: 399, password: "#RagaviR#" },
  { name: "Ranjani R", college: "SKP Engineering College", dept: "B.E. – ECE", phone: "9360487295", email: "ranjaniraja092007@gmail.com", fee: 399, password: "#RanjaniR#" },
  { name: "Keerthana", college: "KLNCE", dept: "AI&DS", phone: "8667263315", email: "keerthna31.ks@gmail.com", fee: 699, password: "#Keerthana#" },
  { name: "Sharanya", college: "Jesse degree College", dept: "DSA", phone: "8971956943", email: "sharanyashankar2006@gmail.com", fee: 699, password: "#Sharanya#" },
  { name: "K Supriya", college: "Amrita college of Engineering and Technology", dept: "DSA", phone: "8270263317", email: "kp6245896@gmail.com", fee: 699, password: "#KSupriya#" },
];

let created = 0;
let skipped = 0;
const failures = [];

for (const s of students) {
  const { data: existing } = await admin.from("students").select("id").eq("email", s.email).maybeSingle();
  if (existing) {
    console.log(`SKIP (already exists): ${s.name} <${s.email}>`);
    skipped++;
    continue;
  }

  const { data: authUser, error: authError } = await admin.auth.admin.createUser({
    email: s.email,
    password: s.password,
    email_confirm: true,
    user_metadata: { role: "student", full_name: s.name },
  });

  if (authError || !authUser.user) {
    console.error(`FAILED (auth) ${s.name} <${s.email}>:`, authError?.message);
    failures.push({ student: s.name, stage: "auth", error: authError?.message });
    continue;
  }

  const { data: student, error: studentError } = await admin
    .from("students")
    .insert({
      user_id: authUser.user.id,
      name: s.name,
      email: s.email,
      phone: s.phone,
      course: s.dept,
      batch: s.college,
      joining_date: new Date().toISOString().slice(0, 10),
      original_fee: s.fee * 3,
      scholarship: 0,
    })
    .select("id")
    .single();

  if (studentError || !student) {
    console.error(`FAILED (student row) ${s.name}:`, studentError?.message);
    await admin.auth.admin.deleteUser(authUser.user.id);
    failures.push({ student: s.name, stage: "student", error: studentError?.message });
    continue;
  }

  // All installments payable immediately -- no sequential locking.
  const rows = DUE_DATES.map((due, i) => ({
    student_id: student.id,
    installment_name: `Month ${i + 1}`,
    amount: s.fee,
    due_date: due,
    sequence_no: i + 1,
    status: "pending",
  }));

  const { error: installError } = await admin.from("installments").insert(rows);
  if (installError) {
    console.error(`FAILED (installments) ${s.name}:`, installError.message);
    failures.push({ student: s.name, stage: "installments", error: installError.message });
    continue;
  }

  console.log(`OK: ${s.name} <${s.email}> -> student ${student.id}`);
  created++;
}

console.log(`\nDone. Created: ${created}, Skipped (existing): ${skipped}, Failed: ${failures.length}`);
if (failures.length) console.log(JSON.stringify(failures, null, 2));
