package net.jlefever.seacap;

import java.nio.ByteBuffer;

import com.google.gson.Gson;
import com.zaxxer.nuprocess.NuAbstractProcessHandler;
import com.zaxxer.nuprocess.NuProcess;

class ProcessHandler extends NuAbstractProcessHandler
{
    private final Gson gson;
    private boolean busy;
    private NuProcess process;

    public ProcessHandler(Gson gson)
    {
        this.gson = gson;
        this.busy = true;
    }

    public boolean isBusy()
    {
        return busy;
    }

    @Override
    public void onStart(NuProcess process)
    {
        this.process = process;
    }

    @Override
    public boolean onStdinReady(ByteBuffer buffer)
    {
        var line = "{\"command\":\"generate-tags\", \"filename\":\"test.rb\", \"size\": 17}\ndef foobaz() end";
        buffer.put(line.getBytes());
        buffer.flip();
        return false;
    }

    @Override
    public void onStdout(ByteBuffer buffer, boolean closed)
    {
        if (!closed)
        {
            var bytes = new byte[buffer.remaining()];
            buffer.get(bytes);
            var text = new String(bytes);
            System.out.println(text);

            var message = this.gson.fromJson(text, CTagsMessage.class);

            if (message.isProgram())
            {
                this.busy = false;
            }
        }
        

        // if (!closed)
        // {
        // byte[] bytes = new byte[buffer.remaining()];
        // // You must update buffer.position() before returning (either implicitly,
        // // like this, or explicitly) to indicate how many bytes your handler has consumed.
        // buffer.get(bytes);
        // var text = new String(bytes);

        // // var message = this.gson.fromJson(text, CTagsMessage.class);
        // // System.out.println(message.getType());

        // System.out.println(text);

        // // For this example, we're done, so closing STDIN will cause the "cat" process to exit
        // // process.closeStdin(true);
        // }
    }

    // public void onStderr(ByteBuffer buffer, boolean closed)
    // {
    // var bytes = new byte[buffer.remaining()];
    // buffer.get(bytes);
    // System.out.println(new String(bytes));
    // }
}