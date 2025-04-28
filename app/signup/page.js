"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import bcrypt from "bcryptjs";
import { useRouter } from "next/navigation";
import {
  Check,
  X,
  User,
  Mail,
  Phone,
  Lock,
  Upload,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import FloatingIcons from "@/components/floating-icons";

import useUsers from "@/hooks/user.zustand";

import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import {
  AllDefaultWallets,
  defineStashedWallet,
  WalletAdapter,
  WalletProvider,
} from "@suiet/wallet-kit";
import '@suiet/wallet-kit/style.css';


import {
  ConnectButton,
  useAccountBalance,
  useWallet,
  SuiChainId,
  ErrorCode,
} from "@suiet/wallet-kit";
import { Transaction } from "@mysten/sui/transactions";
import { useEffect, useMemo } from "react";
import { Ed25519PublicKey } from "@mysten/sui/keypairs/ed25519";
import { Buffer } from "buffer";

const sampleNft = new Map([
  [
    "sui:devnet",
    "0xe146dbd6d33d7227700328a9421c58ed34546f998acdc42a1d05b4818b49faa2::nft::mint",
  ],
  [
    "sui:testnet",
    "0x5ea6aafe995ce6506f07335a40942024106a57f6311cb341239abf2c3ac7b82f::nft::mint",
  ],
  [
    "sui:mainnet",
    "0x5b45da03d42b064f5e051741b6fed3b29eb817c7923b83b92f37a1d2abf4fbab::nft::mint",
  ],
]);

function App() {
  const wallet = useWallet();
  //const { balance } = useAccountBalance();
  const nftContractAddr = useMemo(() => {
    if (!wallet.chain) return "";
    return sampleNft.get(wallet.chain.id) ?? "";
  }, [wallet]);

  useEffect(() => {
    console.log("useEffec called");
    if (wallet.connected) {
      console.log("wallet connected :",wallet);
    }

  }, [wallet]);


  function uint8arrayToHex(value) {
    if (!value) return "";
    // @ts-ignore
    return value.toString("hex");
  }

  async function handleExecuteMoveCall(target) {
    if (!target) return;

    try {
      const tx = new Transaction();
      tx.moveCall({
        target: target,
        arguments: [
          tx.pure.string("Suiet NFT"),
          tx.pure.string("Suiet Sample NFT"),
          tx.pure.string(
            "https://xc6fbqjny4wfkgukliockypoutzhcqwjmlw2gigombpp2ynufaxa.arweave.net/uLxQwS3HLFUailocJWHupPJxQsli7aMgzmBe_WG0KC4"
          ),
        ],
      });
      const resData = await wallet.signAndExecuteTransaction({
        transaction: tx,
      });
      console.log("executeMoveCall success", resData);
      alert("executeMoveCall succeeded (see response in the console)");
    } catch (e) {
      console.error("executeMoveCall failed", e);
      alert("executeMoveCall failed (see response in the console)");
    }
  }

  async function handleSignMsg() {
    if (!wallet.account) return;
    try {
      const msg = "Hello world!";
      const msgBytes = new TextEncoder().encode(msg);
      const result = await wallet.signPersonalMessage({
        message: msgBytes,
      });
      const verifyResult = await wallet.verifySignedMessage(
        result,
        wallet.account.publicKey
      );
      console.log("verify signedMessage", verifyResult);
      if (!verifyResult) {
        alert(`signMessage succeed, but verify signedMessage failed`);
      } else {
        alert(`signMessage succeed, and verify signedMessage succeed!`);
      }
    } catch (e) {
      console.error("signMessage failed", e);
      alert("signMessage failed (see response in the console)");
    }
  }

  const handleSignTxnAndVerifySignature = async (contractAddress) => {
    const txn = new Transaction();
    txn.moveCall({
      target: contractAddress ,
      arguments: [
        txn.pure.string("Suiet NFT"),
        txn.pure.string("Suiet Sample NFT"),
        txn.pure.string(
          "https://xc6fbqjny4wfkgukliockypoutzhcqwjmlw2gigombpp2ynufaxa.arweave.net/uLxQwS3HLFUailocJWHupPJxQsli7aMgzmBe_WG0KC4"
        ),
      ],
    });
    txn.setSender(wallet.account?.address );

    try {
      const signedTxn = await wallet.signTransaction({
        transaction: txn,
      });

      console.log(`Sign and verify txn:`);
      console.log("--wallet: ", wallet.adapter?.name);
      console.log("--account: ", wallet.account?.address);
      const publicKey = wallet.account?.publicKey;
      if (!publicKey) {
        console.error("no public key provided by wallet");
        return;
      }
      console.log("-- publicKey: ", publicKey);
      const pubKey = new Ed25519PublicKey(publicKey);
      console.log("-- signed txnBytes: ", signedTxn.bytes);
      console.log("-- signed signature: ", signedTxn.signature);
      const txnBytes = new Uint8Array(Buffer.from(signedTxn.bytes, "base64"));
      const isValid = await pubKey.verifyTransaction(txnBytes, signedTxn.signature);
      console.log("-- use pubKey to verify transaction: ", isValid);
      if (!isValid) {
        alert(`signTransaction succeed, but verify transaction failed`);
      } else {
        alert(`signTransaction succeed, and verify transaction succeed!`);
      }
    } catch (e) {
      console.error("signTransaction failed", e);
      alert("signTransaction failed (see response in the console)");
    }
  };

  const chainName = (chainId) => {
    switch (chainId) {
      case SuiChainId.MAIN_NET:
        return "Mainnet";
      case SuiChainId.TEST_NET:
        return "Testnet";
      case SuiChainId.DEV_NET:
        return "Devnet";
      default:
        return "Unknown";
    }
  };

  return (
    <div className="App">
      <h1>Vite + Suiet Kit</h1>
      <div className="card">
        <ConnectButton
          onConnectError={(error) => {
            if (error.code === ErrorCode.WALLET__CONNECT_ERROR__USER_REJECTED) {
              console.warn(
                "user rejected the connection to " + error.details?.wallet
              );
            } else {
              console.warn("unknown connect error: ", error);
            }
          }}
        />


        {!wallet.connected ? (
          <p>Connect DApp with Suiet wallet from now!</p>
        ) : (
          <div>
            <div>
              <p>current wallet: {wallet.adapter?.name}</p>
              <p>
                wallet status:{" "}
                {wallet.connecting
                  ? "connecting"
                  : wallet.connected
                  ? "connected"
                  : "disconnected"}
              </p>
              <p>wallet address: {wallet.account?.address}</p>
              <p>current network: {wallet.chain?.name}</p>
              <p>wallet balance: {String(balance)} SUI</p>
              <p>
                wallet publicKey: {uint8arrayToHex(wallet.account?.publicKey)}
              </p>
            </div>
            
          </div>
        )}
      </div>
      <p className="read-the-docs">
        Click on the Vite and Suiet logos to learn more
        yeh wallet
      </p>


    </div>
  );
}


export default function SignupPage() {

  const wallet = useWallet();
  //const { balance } = useAccountBalance();
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    phone: "",
    email: "",
    imageUrl: "",
    bio: "",
    dob: "",
    gender: "",
  });

  const [errors, setErrors] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    phone: "",
    email: "",
    imageUrl: "",
    bio: "",
    dob: "",
    gender: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const setUser = useUsers((state) => state.setNewUser);

  const validateForm = () => {
    let valid = true;
    const newErrors = { ...errors };

    // Username validation
    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
      valid = false;
    } else {
      newErrors.username = "";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
      valid = false;
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
      valid = false;
    } else if (!/\d/.test(formData.password)) {
      newErrors.password = "Password must contain at least one number";
      valid = false;
    } else {
      newErrors.password = "";
    }

    // Confirm password validation
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
      valid = false;
    } else {
      newErrors.confirmPassword = "";
    }

    // Phone validation
    if (!formData.phone) {
      newErrors.phone = "Phone number is required";
      valid = false;
    } else if (!/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = "Phone must be a 10-digit number";
      valid = false;
    } else {
      newErrors.phone = "";
    }

    // Email validation
    if (!formData.email) {
      newErrors.email = "Email is required";
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
      valid = false;
    } else {
      newErrors.email = "";
    }

    // Image URL validation
    if (!formData.imageUrl) {
      newErrors.imageUrl = "Profile image is required";
      valid = false;
    } else {
      newErrors.imageUrl = "";
    }

    setErrors(newErrors);
    return valid;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageUpload = (e) => {
    // In a real app, this would upload to a storage service
    // For this example, we'll just set the URL directly
    // const file = e.target.files[0];
    // if (file) {
    //   // Simulate upload and getting a URL back
    //   setTimeout(() => {
    //     const fakeUrl = `https://drive.google.com/fake-image-${Date.now()}.jpg`;
    //     setFormData((prev) => ({
    //       ...prev,
    //       imageUrl: fakeUrl,
    //     }));
    //   }, 1000);
    // }
    //set;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Hash the password
      const hashedPassword = await bcrypt.hash(formData.password, 10);
      console.log("Wallet :",wallet);

      // Prepare data for API call
      const userData = {
        name: formData.username,
        password: hashedPassword, // Send hashed password
        phone: formData.phone,
        email: formData.email,
        imageUrl: formData.imageUrl,
        dob: formData.dob,
        bio: formData.bio,

        //friendRequests: 0,  -> make edge instead
        //likedPosts: 0,  -> make edge instead
      };

      // Simulate API call
      console.log("Sending data to API:", userData);

      fetch("/api/createNode", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          label: ["USER"],
          properties: userData,
        }),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          return response.json(); // Parse JSON correctly
        })
        .then((data) => console.log(data))
        .catch((error) => console.error("Error:", error));

      //Simulate successful response

      setTimeout(() => {
        setIsSuccess(true);
        setTimeout(() => {
          //setUser(userData);
          setUser({
            ...userData,
            followers: 1,
            following: 0,
            posts: 0,
          });

          router.push("/profile");
        }, 2000);
      }, 1500);
    } catch (error) {
      console.error("Error during signup:", error);
    } finally {
      setIsSubmitting(false);
    }
  };


  const nftContractAddr = useMemo(() => {
    if (!wallet.chain) return "";
    return sampleNft.get(wallet.chain.id) ?? "";
  }, [wallet]);

  useEffect(() => {
    console.log("useEffec called");
    if (wallet.connected) {
      console.log("wallet connected :",wallet);
    }

  }, [wallet]);


  function uint8arrayToHex(value) {
    if (!value) return "";
    // @ts-ignore
    return value.toString("hex");
  }




  return (
    <div className="min-h-screen flex items-center justify-center ">
      <FloatingIcons />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="border-2 shadow-lg backdrop-blur-sm bg-background/80">
          <CardHeader>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <CardTitle className="text-2xl font-bold text-center">
                Create Your Account
              </CardTitle>
              <CardDescription className="text-center mt-2">
                Join our community and start sharing
              </CardDescription>
            </motion.div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <motion.div
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <div className="space-y-2">
                  <Label htmlFor="username" className="flex items-center gap-2">
                    <User size={16} />
                    Username
                  </Label>
                  <div className="relative">
                    <Input
                      id="username"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      className={`pr-10 ${
                        errors.username ? "border-destructive" : ""
                      }`}
                      placeholder="Choose a unique username"
                    />
                    {errors.username && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-destructive text-sm mt-1 flex items-center gap-1"
                      >
                        <X size={14} /> {errors.username}
                      </motion.div>
                    )}
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                <div className="space-y-2">
                  <Label htmlFor="password" className="flex items-center gap-2">
                    <Lock size={16} />
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleChange}
                      className={`pr-10 ${
                        errors.password ? "border-destructive" : ""
                      }`}
                      placeholder="Min 8 characters with numbers"
                    />
                    {errors.password && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-destructive text-sm mt-1 flex items-center gap-1"
                      >
                        <X size={14} /> {errors.password}
                      </motion.div>
                    )}
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                <div className="space-y-2">
                  <Label
                    htmlFor="confirmPassword"
                    className="flex items-center gap-2"
                  >
                    <Lock size={16} />
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={`pr-10 ${
                        errors.confirmPassword ? "border-destructive" : ""
                      }`}
                      placeholder="Confirm your password"
                    />
                    {errors.confirmPassword && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-destructive text-sm mt-1 flex items-center gap-1"
                      >
                        <X size={14} /> {errors.confirmPassword}
                      </motion.div>
                    )}
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.5 }}
              >
                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center gap-2">
                    <Phone size={16} />
                    Phone Number
                  </Label>
                  <div className="relative">
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      className={`pr-10 ${
                        errors.phone ? "border-destructive" : ""
                      }`}
                      placeholder="10-digit phone number"
                    />
                    {errors.phone && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-destructive text-sm mt-1 flex items-center gap-1"
                      >
                        <X size={14} /> {errors.phone}
                      </motion.div>
                    )}
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.5 }}
              >
                <div className="space-y-2">
                  <Label htmlFor="bio" className="flex items-center gap-2">
                    <div size={16} />
                    bio
                  </Label>
                  <div className="relative">
                    <Input
                      id="bio"
                      name="bio"
                      type="text"
                      value={formData.bio}
                      onChange={handleChange}
                      className={`pr-10 ${
                        errors.bio ? "border-destructive" : ""
                      }`}
                      placeholder="Describe yourself"
                    />
                    {errors.bio && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-destructive text-sm mt-1 flex items-center gap-1"
                      >
                        <X size={14} /> {errors.bio}
                      </motion.div>
                    )}
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.5 }}
              >
                <div className="space-y-2">
                  <Label htmlFor="date" className="flex items-center gap-2">
                    <div size={16} />
                    date 
                  </Label>
                  <div className="relative">
                    <Input
                      id="date"
                      name="dob"
                      type="date"
                      value={formData.dob}
                      onChange={handleChange}
                      className={`pr-10 ${
                        errors.date ? "border-destructive" : ""
                      }`}
                      placeholder="Date of Birth"
                    />
                    {errors.date && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-destructive text-sm mt-1 flex items-center gap-1"
                      >
                        <X size={14} /> {errors.date}
                      </motion.div>
                    )}
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.5 }}
              >
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail size={16} />
                    Email Address
                  </Label>
                  <div className="relative">
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`pr-10 ${
                        errors.email ? "border-destructive" : ""
                      }`}
                      placeholder="your@email.com"
                    />
                    {errors.email && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-destructive text-sm mt-1 flex items-center gap-1"
                      >
                        <X size={14} /> {errors.email}
                      </motion.div>
                    )}
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.5 }}
              >
                <div className="space-y-2">
                  <Label
                    htmlFor="imageUpload"
                    className="flex items-center gap-2"
                  >
                    <Upload size={16} />
                    Profile Image URL
                  </Label>
                  <div className="relative">
                    <Input
                      id="imageUrl"
                      type="url"
                      name="imageUrl"
                      // accept="image/*"
                      //onChange={handleImageUpload}
                      onChange={handleChange}
                      value={formData.imageUrl}
                      placeholder="Upload your image and give its URL"
                      className={`pr-10 ${
                        errors.imageUrl ? "border-destructive" : ""
                      }`}
                    />
                    {formData.imageUrl && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-green-500 text-sm mt-1 flex items-center gap-1"
                      >
                        <Check size={14} /> Image got successfully
                      </motion.div>
                    )}
                    {errors.imageUrl && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-destructive text-sm mt-1 flex items-center gap-1"
                      >
                        <X size={14} /> {errors.imageUrl}
                      </motion.div>
                    )}
                  </div>
                </div>
              </motion.div>

             

              <WalletProvider
                  defaultWallets={[
                    ...AllDefaultWallets,
                    defineStashedWallet({
                      appName: "Suiet Kit Playground",
                    }),
                  ]}
                >
                  <div className={styles.container}>
                    <Head>
                      <title>Create Next App</title>
                      <meta name="description" content="Generated by create next app" />
                      <link rel="icon" href="/favicon.ico" />
                    </Head>
                        <div className="App">
                            <h1>Vite + Suiet Kit</h1>
                            <div className="card">
                              <ConnectButton
                                onConnectError={(error) => {
                                  if (error.code === ErrorCode.WALLET__CONNECT_ERROR__USER_REJECTED) {
                                    console.warn(
                                      "user rejected the connection to " + error.details?.wallet
                                    );
                                  } else {
                                    console.warn("unknown connect error: ", error);
                                  }
                                }}
                              />


                              {!wallet.connected ? (
                                <p>Connect DApp with Suiet wallet from now!</p>
                              ) : (
                                <div>
                                  <div>
                                    <p>current wallet: {wallet.adapter?.name}</p>
                                    <p>
                                      wallet status:{" "}
                                      {wallet.connecting
                                        ? "connecting"
                                        : wallet.connected
                                        ? "connected"
                                        : "disconnected"}
                                    </p>
                                    <p>wallet address: {wallet.account?.address}</p>
                                    <p>current network: {wallet.chain?.name}</p>
                                    {/* <p>wallet balance: {String(balance)} SUI</p> */}
                                    <p>
                                      wallet publicKey: {uint8arrayToHex(wallet.account?.publicKey)}
                                    </p>
                                  </div>
                                  
                                </div>
                              )}
                            </div>
                            <p className="read-the-docs">
                              Click on the Vite and Suiet logos to learn more
                              yeh wallet
                            </p>


                          </div>
                  </div>
                </WalletProvider>


                <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.9, duration: 0.5 }}
                className="pt-4"
              >
                <Button
                  type="submit"
                  className="w-full h-11 relative overflow-hidden group"
                  disabled={isSubmitting || isSuccess}
                >
                  <motion.span
                    animate={isSuccess ? { y: -30 } : { y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="inline-flex items-center gap-2"
                  >
                    {isSubmitting ? "Creating Account..." : "Sign Up"}
                    {isSubmitting && (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          repeat: Number.POSITIVE_INFINITY,
                          duration: 1,
                          ease: "linear",
                        }}
                      >
                        <Sparkles size={16} />
                      </motion.div>
                    )}
                  </motion.span>

                  {isSuccess && (
                    <motion.span
                      initial={{ y: 30 }}
                      animate={{ y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="absolute inset-0 flex items-center justify-center text-primary-foreground"
                    >
                      <Check className="mr-2" size={16} /> Success!
                    </motion.span>
                  )}
                </Button>
              </motion.div>

            </form>
          </CardContent>

          <CardFooter className="flex justify-center">
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.5 }}
              className="text-sm text-muted-foreground"
            >
              Already have an account?{" "}
              <Button
                variant="link"
                className="p-0"
                onClick={() => router.push("/login")}
              >
                Log in
              </Button>
            </motion.p>
          </CardFooter>
        </Card>
      </motion.div>



    </div>
  );
}




