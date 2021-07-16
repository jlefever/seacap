package net.jlefever.dsmutils;

import java.io.IOException;

public class ProcessUtils
{
    public static Process run(ProcessBuilder builder)
    {
        try
        {
            var process = builder.start();

            if (process.waitFor() != 0)
            {
                throw new RuntimeException();
            }

            return process;
        }
        catch (IOException | InterruptedException e)
        {
            throw new RuntimeException(e);
        }
    }
}
