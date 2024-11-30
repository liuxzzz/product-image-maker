"use client";
import { useState, useEffect, useRef } from "react";
import { Button } from "@nextui-org/button";
import { Input } from "@nextui-org/input";
import { UploadIcon, DownloadIcon } from "@/components/icons";
import localFont from "next/font/local";

// 导入字体
const customFont = localFont({
  src: "../font/YouSheYuFeiTeJianKangTi-2.ttf", // 替换为你的字体文件路径
  variable: "--font-custom",
});

export default function Home() {
  const [uploadedImages, setUploadedImages] = useState<HTMLImageElement[]>([]);
  const [text, setText] = useState<string>("");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // 设置 canvas 尺寸
      canvas.width = 3000;
      canvas.height = 1000;

      // 清空 canvas 并设置白色背景
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 绘制图片
      uploadedImages.forEach((img, index) => {
        if (index < 3) {
          const targetWidth = 1000;
          const targetHeight = 1000;
          const x = index * 1000;

          let sourceX = 0;
          let sourceY = 0;
          let sourceWidth = img.width;
          let sourceHeight = img.height;

          if (img.width / img.height > 1) {
            sourceWidth = img.height;
            sourceX = (img.width - sourceWidth) / 2;
          } else {
            sourceHeight = img.width;
            sourceY = (img.height - sourceHeight) / 2;
          }

          ctx.drawImage(
            img,
            sourceX,
            sourceY,
            sourceWidth,
            sourceHeight,
            x,
            0,
            targetWidth,
            targetHeight
          );
        }
      });

      // 绘制文字
      if (text) {
        ctx.save();

        // 使用自定义字体
        ctx.font = `256px ${customFont.style.fontFamily}`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        // 计算 canvas 中心点
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;

        // 设置描边样式
        ctx.strokeStyle = "#BD8B4C";
        ctx.lineWidth = 36;
        ctx.strokeText(text, centerX, centerY);

        // 设置文字填充颜色并绘制
        ctx.fillStyle = "white";
        ctx.fillText(text, centerX, centerY);

        ctx.restore();
      }
    }
  }, [uploadedImages, text, customFont.loaded]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const filesArray = Array.from(files);

      // 只处理前三张图片
      filesArray.slice(0, 3).forEach((file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const img = new Image();
          img.onload = () => {
            setUploadedImages((prev) => [...prev, img]);
          };
          img.src = e.target?.result as string;
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (!text) {
      alert("请输入文字");
      return;
    }

    if (uploadedImages.length === 0) {
      alert("请上传图片");
      return;
    }

    // 创建一个临时 canvas 用于裁切
    const tempCanvas = document.createElement("canvas");
    const tempCtx = tempCanvas.getContext("2d");
    if (!tempCtx) return;

    // 设置临时 canvas 的尺寸为单个图片的大小
    tempCanvas.width = 1000;
    tempCanvas.height = 1000;

    // 下载三张图片
    for (let i = 0; i < 3; i++) {
      // 清空临时 canvas
      tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);

      // 将原始 canvas 的对应部分绘制到临时 canvas
      tempCtx.drawImage(
        canvas,
        i * 1000,
        0, // 源图像的起始位置
        1000,
        1000, // 源图像的裁切尺寸
        0,
        0, // 目标位置
        1000,
        1000 // 目标尺寸
      );

      // 创建下载链接
      const link = document.createElement("a");
      link.download = `${text}-${i + 1}.png`; // 设置下载文件名

      // 将 canvas 转换为 blob URL
      tempCanvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          link.href = url;
          link.click();

          // 清理 blob URL
          setTimeout(() => {
            URL.revokeObjectURL(url);
          }, 100);
        }
      }, "image/png");
    }
  };

  return (
    <section
      className={`flex flex-col items-center justify-center h-full py-8 md:py-10 ${customFont.variable}`}
    >
      <div className="inline-block max-w-xl text-center justify-center">
        <input
          type="file"
          id="imageUpload"
          className="hidden"
          accept="image/*"
          multiple
          onChange={handleFileChange}
        />
        <Button
          endContent={<UploadIcon />}
          size="lg"
          onClick={() => document.getElementById("imageUpload")?.click()}
        >
          上传图片
        </Button>
      </div>

      <div className="mt-8 w-full max-w-xl">
        <Input
          type="text"
          label="输入要显示的文字"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="max-w-xl"
        />
      </div>

      <div className="mt-8">
        <canvas
          ref={canvasRef}
          className="border border-gray-300 rounded-lg"
          style={{ width: "1500px", height: "500px" }}
        />
      </div>

      <div className="mt-8">
        <Button
          endContent={<DownloadIcon />}
          size="lg"
          onClick={handleDownload}
        >
          下载图片
        </Button>
      </div>
    </section>
  );
}
