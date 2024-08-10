
// Firebase
import { db } from "../../firebase";
import { collection, doc, setDoc, addDoc, getDocs,getDoc,query, where } from "firebase/firestore";

export const getCurrentTripStatus = async (regNum,uid) => {
    const tripQuery = query(collection(db, "trips"), where("uid", "==", uid));
    const tripSnapshot = await getDocs(tripQuery);
    let tripData = [];
    tripSnapshot.forEach((doc) => {
        if (doc.data().reg_num === regNum) {
            tripData.push(doc.data());
        }
    });
    return tripData;
}

export const getStartedTrips = async (uid)=>{
    const tripQuery = query(collection(db, "trips"), where("uid", "==", uid), where("status", "==","started"));
    const tripSnapshot = await getDocs(tripQuery);
    let tripData = [];
    tripSnapshot.forEach((doc) => {
        tripData.push(doc.data());
    });
    return tripData;
}
// interface statusObj {
//     uid?:string,
//     from?:strin,
//     to:string,
//     reg_num:string,
//     status:string,
//     toll:Number,
//     date:string
// }

export const updateTripStatus = async (status,uid) => {
    const collectionRef = collection(db, "trips");
    const tripQuery = query(collectionRef, where("uid", "==", uid), where("reg_num", "==", status.reg_num), where("status", "==", "started"));
    const tripSnapshot = await getDocs(tripQuery);

    if (tripSnapshot.empty) {
        await addDoc(collectionRef, status);
    } else {
        tripSnapshot.forEach(async (trip) => {
            if (trip.data().reg_num === status.reg_num) {
                const docRef = doc(collectionRef, trip.id);
                await setDoc(docRef, status, { merge: true });
            }
        });
    }
}


export const chargeUser = async (amount,uid) => {
    const balanceDocRef = doc(db, 'balances', uid);
    const balanceDoc = await getDoc(balanceDocRef);
    
    if (balanceDoc.exists()) {
        const currentBalance = balanceDoc.data().balance;
        if (currentBalance >= amount) {
            await setDoc(balanceDocRef, { balance: currentBalance - amount }, { merge: true });
            return true;
        } else {
            return false;
        }
    } else {
        // Create a new balance document for the first-time user
        await setDoc(balanceDocRef, { balance: 0 });
        return false;
    }
}

export const isBalanceEnough = async (uid) => {
    const chargesSnapshot = await getDocs(query(collection(db, "charges")))
      let maxCharge = 0;
      chargesSnapshot.forEach((doc)=>{
        let chg = parseFloat(doc.data().Charge)
        if(chg>maxCharge) maxCharge=chg
      })

    const balanceDocRef = doc(db, 'balances', uid);
    const balanceDoc = await getDoc(balanceDocRef);
    
    if (balanceDoc.exists()) {
        const currentBalance = balanceDoc.data().balance;
        if (currentBalance >= maxCharge) {
            return true;
        } else {
            return false;
        }
    } else {
        return false;
    }
}

export const validateQR = (qrText) => {
    if(!qrText) return false
    const l = qrText.split("_");
    if (l.length !== 2) {
        return false;
    } else if (l[1] === "IN" || l[1] === "OUT") {
        return l;
    } else {
        return false;
    }
};

export const getToll = async (interchange_1, interchange_2) => {
    const collectionRef = collection(db, "charges");
    const tollQuery = query(
        collectionRef,
        where("From", "==", interchange_1),
        where("To", "==", interchange_2)
    );
    const reverseTollQuery = query(
        collectionRef,
        where("From", "==", interchange_2),
        where("To", "==", interchange_1)
    );

    let tollSnapshot = await getDocs(tollQuery);

    if (tollSnapshot.empty) {
        tollSnapshot = await getDocs(reverseTollQuery);
    }

    if (tollSnapshot.empty) {
        return false;
    } else {
        return tollSnapshot.docs[0].data().Charge;
    }
};

export const updateGateStatus = async (interchange, interchange_type, status) => {
    console.log("update gate",interchange, interchange_type, status)
    const gateDoc = await getDoc(doc(db, 'toll_gate_state', interchange));
    
    if (gateDoc.exists()) {
        await setDoc(doc(collection(db, "toll_gate_state"), gateDoc.id), { [interchange_type.toLowerCase()]: status }, { merge: true });

        if (status.toLowerCase() === "open") {
            setTimeout(async () => {
                await setDoc(doc(collection(db, "toll_gate_state"), gateDoc.id), { [interchange_type.toLowerCase()]: "close" }, { merge: true });
            }, 5000); // Wait for 5000 milliseconds (5 seconds)
        }
    } else {
        console.error(`No such document with interchange: ${interchange}`);
    }
};



//   const balanceDoc = await getDoc(doc(db, 'balances', uid));
//     if (balanceDoc.exists()) {
//       setBalance(balanceDoc.data().balance);
//     } else {
//       // Create a new balance document for the first-time user
//       await setDoc(doc(db, 'balances', uid), { balance: 0 });
//       setBalance(0);
//     }

