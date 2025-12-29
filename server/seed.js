const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// 1. Load Models
require('./models/User'); 
const User = mongoose.model("User");

require('./models/Post'); 
const Post = mongoose.model("Post");

// YOUR REAL DB URL
const MONGOURI = "mongodb+srv://cheranit23_db_user:cheran0308@cluster0.jwiz8pu.mongodb.net/instagram"; 

mongoose.connect(MONGOURI);

// DATA LISTS FOR RANDOM GENERATION
const firstNames = ["James", "Mary", "Robert", "Patricia", "John", "Jennifer", "Michael", "Linda", "David", "Elizabeth", "William", "Barbara", "Richard", "Susan", "Joseph", "Jessica", "Thomas", "Sarah", "Charles", "Karen", "Christopher", "Nancy", "Daniel", "Lisa", "Matthew", "Margaret", "Anthony", "Betty", "Donald", "Sandra", "Mark", "Ashley", "Paul", "Dorothy", "Steven", "Kimberly", "Andrew", "Emily", "Kenneth", "Donna", "Joshua", "Michelle", "Kevin", "Carol", "Brian", "Amanda", "George", "Melissa", "Edward", "Deborah", "Ronald", "Stephanie", "Timothy", "Rebecca", "Jason", "Laura", "Jeffrey", "Sharon", "Ryan", "Cynthia", "Jacob", "Kathleen", "Gary", "Amy", "Nicholas", "Shirley", "Eric", "Angela", "Jonathan", "Helen", "Stephen", "Anna", "Larry", "Brenda", "Justin", "Pamela", "Scott", "Nicole", "Brandon", "Emma", "Benjamin", "Samantha", "Samuel", "Katherine", "Gregory", "Christine", "Frank", "Debra", "Alexander", "Rachel", "Raymond", "Catherine", "Patrick", "Carolyn", "Jack", "Janet", "Dennis", "Ruth", "Jerry"];
const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin", "Lee", "Perez", "Thompson", "White", "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson", "Walker", "Young", "Allen", "King", "Wright", "Scott", "Torres", "Nguyen", "Hill", "Flores", "Green", "Adams", "Nelson", "Baker", "Hall", "Rivera", "Campbell", "Mitchell", "Carter", "Roberts"];

// CAPTIONS FOR POSTS
const captions = [
    "Loving the view! 📸", "Just another day in paradise.", "Work hard, play hard.", "Sunday vibes.", "Coffee first. ☕", "Adventure awaits!", "Throwback Thursday.", "Good times with good people.", "Nature lover 🌲", "City lights.", "Foodie for life 🍕", "Gym time! 💪", "Blessed.", "Dream big.", "Stay positive."
];

const seedDB = async () => {
    try {
        console.log("Connecting to Database...");
        
        // CLEAR OLD DATA (Optional: Comment these out if you want to keep existing users)
        await User.deleteMany({}); 
        await Post.deleteMany({}); 
        console.log("Old data cleared.");

        const passwordHash = await bcrypt.hash("password123", 12);

        // --- LOOP TO CREATE 100 USERS ---
        for (let i = 0; i < 100; i++) {
            // 1. Generate Random Details
            const randomFirst = firstNames[Math.floor(Math.random() * firstNames.length)];
            const randomLast = lastNames[Math.floor(Math.random() * lastNames.length)];
            const fullName = `${randomFirst} ${randomLast}`;
            const username = `${randomFirst.toLowerCase()}.${randomLast.toLowerCase()}${Math.floor(Math.random() * 1000)}`;
            const email = `${username}@example.com`;
            
            // 2. Assign Gender for Profile Pic (Even = Men, Odd = Women to match API)
            const gender = i % 2 === 0 ? "men" : "women";
            const pic = `https://randomuser.me/api/portraits/${gender}/${i % 99}.jpg`; // % 99 ensures valid ID

            // 3. Create User
            const user = new User({
                name: fullName,
                email: email,
                username: username,
                password: passwordHash, // All passwords are "password123"
                pic: pic,
                bio: `Hello! I am ${fullName}. Welcome to my profile.`
            });
            const savedUser = await user.save();

            // 4. Create a Random Post for this User
            const randomCaption = captions[Math.floor(Math.random() * captions.length)];
            const randomImage = `https://picsum.photos/seed/${i + 500}/600/600`; // Unique image for each post

            const post = new Post({
                title: "My Photo",
                body: randomCaption,
                photo: randomImage,
                postedBy: savedUser
            });
            await post.save();

            console.log(`✅ [${i+1}/100] Created: ${username}`);
        }

        console.log("🎉 SUCCESS: 100+ Users & Posts Created!");
        process.exit();
    } catch (err) {
        console.log("❌ Error:", err);
        process.exit(1);
    }
};

seedDB();