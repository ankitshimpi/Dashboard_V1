export function useToast() {
  return {
    toast: (msg: string) => {
      alert(msg);
    },
  };
}
